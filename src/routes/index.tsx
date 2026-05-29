import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, MapPin, ShieldCheck, Sparkles, ArrowRight, Compass, Heart } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ItemCard, type ItemCardData } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FindIt — Reunite with lost belongings" },
      { name: "description", content: "Post lost or found items, search by location, and reunite with what matters." },
      { property: "og:title", content: "FindIt — Reunite with lost belongings" },
      { property: "og:description", content: "Post lost or found items, search by location, and reunite with what matters." },
    ],
  }),
  component: HomePage,
});

async function fetchHomeData() {
  const [{ data: recent }, { count: lostCount }, { count: foundCount }, { count: resolvedCount }] = await Promise.all([
    supabase
      .from("items")
      .select("id, title, description, category, status, location, event_date, is_resolved, item_images(url, position)")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("items").select("*", { count: "exact", head: true }).eq("status", "lost"),
    supabase.from("items").select("*", { count: "exact", head: true }).eq("status", "found"),
    supabase.from("items").select("*", { count: "exact", head: true }).eq("is_resolved", true),
  ]);

  const items: ItemCardData[] = (recent ?? []).map((r: any) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    status: r.status,
    location: r.location,
    event_date: r.event_date,
    is_resolved: r.is_resolved,
    cover_url:
      (r.item_images ?? []).sort((a: any, b: any) => a.position - b.position)[0]?.url ?? null,
  }));

  return {
    items,
    stats: {
      lost: lostCount ?? 0,
      found: foundCount ?? 0,
      resolved: resolvedCount ?? 0,
    },
  };
}

function HomePage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["home"], queryFn: fetchHomeData });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/browse", search: { q } as any });
  };

  return (
    <div className="min-h-screen hero-bg">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 backdrop-blur px-3 py-1 text-xs text-muted-foreground mb-6 animate-fade-up">
            <Sparkles className="h-3.5 w-3.5 text-teal" />
            A kinder way to lose, and find, things
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight animate-fade-up">
            Lost something?
            <br />
            <span className="italic text-teal">Someone's holding it.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground animate-fade-up">
            FindIt is the modern lost & found community. Post what you've lost, share what you've
            found, and let neighbors reunite belongings with their owners.
          </p>

          <form onSubmit={onSearch} className="glass-strong mt-8 flex items-center gap-2 rounded-2xl p-2 animate-fade-up">
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search 'blue backpack at Central Park'…"
                className="border-0 bg-transparent focus-visible:ring-0 shadow-none px-0 h-11"
              />
            </div>
            <Button type="submit" size="lg" className="rounded-xl">
              Search
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap gap-3 animate-fade-up">
            <Button asChild size="lg" variant="default" className="rounded-xl">
              <Link to="/post"><Compass className="mr-2 h-4 w-4" />I lost something</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl bg-card/60 backdrop-blur">
              <Link to="/post"><Heart className="mr-2 h-4 w-4" />I found something</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Bento stats / features */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-2">
          <StatTile className="md:col-span-2 md:row-span-2" label="Items lost" value={data?.stats.lost} accent="lost" />
          <StatTile className="md:col-span-2" label="Items found" value={data?.stats.found} accent="found" />
          <StatTile className="md:col-span-2" label="Reunited" value={data?.stats.resolved} accent="teal" />
          <FeatureTile
            className="md:col-span-2"
            title="Search by place"
            body="Filter by city, neighborhood, or venue."
            icon={<MapPin className="h-5 w-5" />}
          />
          <FeatureTile
            className="md:col-span-2"
            title="Private & safe"
            body="Owner-only edits, RLS-protected database."
            icon={<ShieldCheck className="h-5 w-5" />}
          />
        </div>
      </section>

      {/* Recent */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-4xl md:text-5xl">Recently posted</h2>
            <p className="mt-1 text-muted-foreground">Fresh items from the community.</p>
          </div>
          <Button asChild variant="ghost">
            <Link to="/browse">Browse all <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="soft-card overflow-hidden">
                <div className="aspect-[4/3] animate-pulse bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.items.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="soft-card p-12 text-center">
            <p className="text-muted-foreground mb-4">No posts yet. Be the first to share.</p>
            <Button asChild><Link to="/post">Post an item</Link></Button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function StatTile({
  label,
  value,
  className = "",
  accent = "teal",
}: {
  label: string;
  value: number | undefined;
  className?: string;
  accent?: "lost" | "found" | "teal";
}) {
  const accentClass =
    accent === "lost"
      ? "text-lost"
      : accent === "found"
        ? "text-found"
        : "text-teal";
  return (
    <div className={`glass rounded-3xl p-6 flex flex-col justify-between ${className}`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`font-display text-6xl md:text-7xl tabular-nums ${accentClass}`}>
        {value ?? "—"}
      </p>
    </div>
  );
}

function FeatureTile({
  title,
  body,
  icon,
  className = "",
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass rounded-3xl p-6 flex flex-col gap-2 ${className}`}>
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
        {icon}
      </div>
      <h3 className="font-display text-2xl">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
