import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MapPin, Calendar, Gift, Tag, ArrowLeft, Mail, Share2, Flag, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CATEGORY_ICONS, type Category } from "@/lib/categories";

export const Route = createFileRoute("/items/$id")({
  component: ItemDetailPage,
});

function ItemDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imgIdx, setImgIdx] = useState(0);

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*, item_images(id, url, position)")
        .eq("id", id)
        .single();
      if (error) throw error;
      let profile: any = null;
      if (data?.user_id) {
        const { data: p } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", data.user_id)
          .maybeSingle();
        profile = p;
      }
      return { ...(data as any), profiles: profile };
    },
  });

  const isOwner = user?.id === item?.user_id;

  const onShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: item?.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  const onResolve = async () => {
    const { error } = await supabase
      .from("items")
      .update({ is_resolved: !item.is_resolved })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(item.is_resolved ? "Marked as active" : "Marked as resolved 🎉");
    location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen hero-bg">
        <Navbar />
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="h-[60vh] animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen hero-bg">
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="font-display text-5xl mb-3">Item not found</h1>
          <p className="text-muted-foreground mb-6">It may have been removed.</p>
          <Button asChild><Link to="/browse">Back to browse</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const images = (item.item_images ?? []).sort((a: any, b: any) => a.position - b.position);
  const icon = CATEGORY_ICONS[item.category as Category] ?? "📦";
  const cover = images[imgIdx]?.url;

  return (
    <div className="min-h-screen hero-bg">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 pt-8 pb-24">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/browse"><ArrowLeft className="mr-1 h-4 w-4" />Back</Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          {/* Gallery */}
          <div>
            <div className="soft-card aspect-[4/3] overflow-hidden">
              {cover ? (
                <img src={cover} alt={item.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-8xl opacity-60">{icon}</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((img: any, i: number) => (
                  <button
                    key={img.id}
                    onClick={() => setImgIdx(i)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      i === imgIdx ? "border-primary" : "border-transparent opacity-70"
                    }`}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider ${
                  item.status === "lost" ? "bg-lost text-lost-foreground" : "bg-found text-found-foreground"
                }`}
              >
                {item.status}
              </span>
              {item.is_resolved && (
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Resolved
                </span>
              )}
              <span className="text-xs text-muted-foreground">{icon} {item.category}</span>
            </div>

            <h1 className="font-display text-5xl leading-tight mb-3">{item.title}</h1>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{item.description}</p>

            <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="Location" value={item.location} />
              <InfoRow icon={<Calendar className="h-4 w-4" />} label={item.status === "lost" ? "Lost on" : "Found on"} value={format(new Date(item.event_date), "MMMM d, yyyy")} />
              {item.reward && <InfoRow icon={<Gift className="h-4 w-4" />} label="Reward" value={item.reward} />}
              <InfoRow icon={<Mail className="h-4 w-4" />} label="Contact" value={item.contact_info} />
            </dl>

            {item.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((t: string) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
                    <Tag className="h-3 w-3" />{t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-2">
              {isOwner ? (
                <>
                  <Button onClick={onResolve}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {item.is_resolved ? "Mark active" : "Mark resolved"}
                  </Button>
                  <Button variant="outline" onClick={() => navigate({ to: "/items/$id/edit", params: { id } })}>
                    Edit
                  </Button>
                </>
              ) : (
                <Button asChild>
                  <a href={`mailto:?subject=About: ${encodeURIComponent(item.title)}&body=${encodeURIComponent(`I saw your post on FindIt about "${item.title}". `)}`}>
                    <Mail className="mr-2 h-4 w-4" />Contact
                  </a>
                </Button>
              )}
              <Button variant="outline" onClick={onShare}>
                <Share2 className="mr-2 h-4 w-4" />Share
              </Button>
              {!isOwner && (
                <Button variant="ghost" onClick={() => toast("Report received. Thanks for keeping FindIt safe.")}>
                  <Flag className="mr-2 h-4 w-4" />Report
                </Button>
              )}
            </div>

            {item.profiles && (
              <div className="glass mt-8 flex items-center gap-3 rounded-2xl p-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  {(item.profiles.full_name ?? "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{item.profiles.full_name ?? "FindIt member"}</p>
                  <p className="text-xs text-muted-foreground">Posted {format(new Date(item.created_at), "MMM d, yyyy")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur p-3">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}