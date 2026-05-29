import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, CheckCircle2, Circle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — FindIt" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["my-items", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("id, title, status, category, location, event_date, is_resolved, created_at, item_images(url, position)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleResolve = async (id: string, current: boolean) => {
    const { error } = await supabase.from("items").update({ is_resolved: !current }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(!current ? "Marked resolved 🎉" : "Reopened");
    qc.invalidateQueries({ queryKey: ["my-items"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["my-items"] });
  };

  const counts = {
    total: items?.length ?? 0,
    resolved: items?.filter((i) => i.is_resolved).length ?? 0,
    active: items?.filter((i) => !i.is_resolved).length ?? 0,
  };

  return (
    <div className="min-h-screen hero-bg">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-24">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-5xl md:text-6xl">Your dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage everything you've posted.</p>
          </div>
          <Button asChild size="lg"><Link to="/post"><Plus className="mr-2 h-4 w-4" />New post</Link></Button>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: counts.total },
            { label: "Active", value: counts.active },
            { label: "Resolved", value: counts.resolved },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="font-display text-4xl text-teal">{s.value}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="soft-card h-24 animate-pulse" />
            ))}
          </div>
        ) : !items || items.length === 0 ? (
          <EmptyState
            title="No posts yet"
            description="Create your first lost or found post to get started."
            action={<Button asChild><Link to="/post">Post an item</Link></Button>}
          />
        ) : (
          <div className="space-y-3">
            {items.map((item: any) => {
              const cover = (item.item_images ?? []).sort((a: any, b: any) => a.position - b.position)[0]?.url;
              return (
                <div key={item.id} className="soft-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <Link to="/items/$id" params={{ id: item.id }} className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                    {cover ? <img src={cover} className="h-full w-full object-cover" alt="" /> : <div className="h-full w-full grid place-items-center text-2xl opacity-50">📦</div>}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${item.status === "lost" ? "bg-lost text-lost-foreground" : "bg-found text-found-foreground"}`}>{item.status}</span>
                      {item.is_resolved && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">Resolved</span>}
                    </div>
                    <Link to="/items/$id" params={{ id: item.id }} className="font-display text-xl hover:underline">{item.title}</Link>
                    <p className="text-xs text-muted-foreground">{item.category} • {item.location} • {format(new Date(item.event_date), "MMM d, yyyy")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleResolve(item.id, item.is_resolved)}>
                      {item.is_resolved ? <Circle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/items/$id/edit" params={{ id: item.id }}><Edit2 className="h-4 w-4" /></Link>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => remove(item.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}