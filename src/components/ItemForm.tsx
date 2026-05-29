import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CATEGORIES } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const schema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(120),
  description: z.string().trim().min(10, "Add a bit more detail").max(2000),
  category: z.string().min(1, "Pick a category"),
  status: z.enum(["lost", "found"]),
  event_date: z.string().min(1, "Required"),
  location: z.string().trim().min(2).max(200),
  contact_info: z.string().trim().min(3).max(200),
  reward: z.string().trim().max(120).optional().or(z.literal("")),
  tags: z.string().max(200).optional().or(z.literal("")),
});

export interface ItemFormInitial {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  status?: "lost" | "found";
  event_date?: string;
  location?: string;
  contact_info?: string;
  reward?: string | null;
  tags?: string[];
  images?: { id: string; url: string }[];
}

export function ItemForm({ initial }: { initial?: ItemFormInitial }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!initial?.id;

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "",
    status: (initial?.status ?? "lost") as "lost" | "found",
    event_date: initial?.event_date ?? new Date().toISOString().slice(0, 10),
    location: initial?.location ?? "",
    contact_info: initial?.contact_info ?? "",
    reward: initial?.reward ?? "",
    tags: (initial?.tags ?? []).join(", "),
  });
  const [existingImages, setExistingImages] = useState(initial?.images ?? []);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const previews = files.map((f) => URL.createObjectURL(f));

  const onFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const list = Array.from(incoming).slice(0, 6 - existingImages.length - files.length);
    setFiles((cur) => [...cur, ...list]);
  };

  const removeExisting = async (id: string) => {
    await supabase.from("item_images").delete().eq("id", id);
    setExistingImages((cur) => cur.filter((i) => i.id !== id));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      return toast.error(parsed.error.errors[0]?.message ?? "Check the form");
    }
    setSubmitting(true);

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      status: form.status,
      event_date: form.event_date,
      location: form.location.trim(),
      contact_info: form.contact_info.trim(),
      reward: form.reward.trim() || null,
      tags,
    };

    let itemId = initial?.id;
    if (isEdit && itemId) {
      const { error } = await supabase.from("items").update(payload).eq("id", itemId);
      if (error) { setSubmitting(false); return toast.error(error.message); }
    } else {
      const { data, error } = await supabase
        .from("items")
        .insert({ ...payload, user_id: user.id })
        .select("id")
        .single();
      if (error || !data) { setSubmitting(false); return toast.error(error?.message ?? "Failed"); }
      itemId = data.id;
    }

    if (files.length > 0 && itemId) {
      const startPos = existingImages.length;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/${itemId}/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await supabase.storage.from("item-images").upload(path, file, { upsert: false });
        if (upErr) { toast.error(upErr.message); continue; }
        const { data: pub } = supabase.storage.from("item-images").getPublicUrl(path);
        await supabase.from("item_images").insert({
          item_id: itemId,
          url: pub.publicUrl,
          position: startPos + i,
        });
      }
    }

    setSubmitting(false);
    toast.success(isEdit ? "Item updated" : "Item posted");
    navigate({ to: "/items/$id", params: { id: itemId! } });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="glass-strong rounded-2xl p-6 space-y-4">
        <div>
          <Label className="mb-3 block">Status</Label>
          <RadioGroup
            value={form.status}
            onValueChange={(v) => setForm({ ...form, status: v as "lost" | "found" })}
            className="grid grid-cols-2 gap-3"
          >
            {(["lost", "found"] as const).map((s) => (
              <label
                key={s}
                className={`cursor-pointer rounded-xl border-2 px-4 py-3 text-sm transition ${
                  form.status === s
                    ? s === "lost"
                      ? "border-lost bg-lost/10"
                      : "border-found bg-found/10"
                    : "border-border"
                }`}
              >
                <RadioGroupItem value={s} className="sr-only" />
                <span className="font-medium capitalize">I {s === "lost" ? "lost" : "found"} something</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Blue leather wallet" />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Distinguishing details, what was inside, etc." />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="date">{form.status === "lost" ? "Date lost" : "Date found"}</Label>
            <Input id="date" type="date" required value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Central Park, NYC" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contact">Contact info</Label>
            <Input id="contact" required value={form.contact_info} onChange={(e) => setForm({ ...form, contact_info: e.target.value })} placeholder="email or phone" />
          </div>
          <div>
            <Label htmlFor="reward">Reward (optional)</Label>
            <Input id="reward" value={form.reward ?? ""} onChange={(e) => setForm({ ...form, reward: e.target.value })} placeholder="$50" />
          </div>
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input id="tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="leather, black, monogram" />
        </div>
      </div>

      <div className="glass-strong rounded-2xl p-6">
        <Label className="mb-3 block">Photos (up to 6)</Label>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {existingImages.map((img) => (
            <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl border border-border">
              <img src={img.url} className="h-full w-full object-cover" alt="" />
              <button type="button" onClick={() => removeExisting(img.id)} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-border">
              <img src={src} className="h-full w-full object-cover" alt="" />
              <button type="button" onClick={() => setFiles((c) => c.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {existingImages.length + files.length < 6 && (
            <label className="aspect-square cursor-pointer rounded-xl border-2 border-dashed border-border grid place-items-center text-muted-foreground hover:border-primary hover:text-primary transition">
              <ImagePlus className="h-5 w-5" />
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
            </label>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Save changes" : "Post item"}
        </Button>
      </div>
    </form>
  );
}