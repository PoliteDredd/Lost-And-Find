import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ItemCard, type ItemCardData } from "@/components/ItemCard";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";

type Search = {
  q?: string;
  status?: "lost" | "found" | "all";
  category?: string;
  location?: string;
  sort?: "newest" | "oldest";
};

export const Route = createFileRoute("/browse")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    status: s.status === "lost" || s.status === "found" ? s.status : "all",
    category: typeof s.category === "string" ? s.category : undefined,
    location: typeof s.location === "string" ? s.location : undefined,
    sort: s.sort === "oldest" ? "oldest" : "newest",
  }),
  head: () => ({
    meta: [
      { title: "Browse items — FindIt" },
      { name: "description", content: "Search lost and found items by keyword, category, and location." },
    ],
  }),
  component: BrowsePage,
});

function BrowsePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const [q, setQ] = useState(search.q ?? "");
  const [location, setLocation] = useState(search.location ?? "");

  useEffect(() => {
    setQ(search.q ?? "");
    setLocation(search.location ?? "");
  }, [search.q, search.location]);

  const { data, isLoading } = useQuery({
    queryKey: ["browse", search],
    queryFn: async () => {
      let query = supabase
        .from("items")
        .select("id, title, description, category, status, location, event_date, is_resolved, item_images(url, position)");

      if (search.status && search.status !== "all") query = query.eq("status", search.status);
      if (search.category) query = query.eq("category", search.category);
      if (search.location) query = query.ilike("location", `%${search.location}%`);
      if (search.q) {
        query = query.or(`title.ilike.%${search.q}%,description.ilike.%${search.q}%`);
      }
      query = query.order("created_at", { ascending: search.sort === "oldest" });

      const { data, error } = await query.limit(60);
      if (error) throw error;
      return (data ?? []).map((r: any): ItemCardData => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        status: r.status,
        location: r.location,
        event_date: r.event_date,
        is_resolved: r.is_resolved,
        cover_url: (r.item_images ?? []).sort((a: any, b: any) => a.position - b.position)[0]?.url ?? null,
      }));
    },
  });

  const update = (patch: Partial<Search>) => {
    navigate({ search: { ...search, ...patch } as any, replace: true });
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update({ q, location });
  };

  return (
    <div className="min-h-screen hero-bg">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-24">
        <div className="mb-8">
          <h1 className="font-display text-5xl md:text-6xl">Browse items</h1>
          <p className="mt-2 text-muted-foreground">Find what was lost. Reunite what was found.</p>
        </div>

        <form onSubmit={onSearchSubmit} className="glass-strong mb-6 rounded-2xl p-4 grid gap-3 md:grid-cols-[2fr_2fr_auto]">
          <div className="flex items-center gap-2 px-3 rounded-xl bg-background/60 border border-border/60">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Keyword" className="border-0 bg-transparent focus-visible:ring-0 shadow-none px-0" />
          </div>
          <div className="flex items-center gap-2 px-3 rounded-xl bg-background/60 border border-border/60">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="border-0 bg-transparent focus-visible:ring-0 shadow-none px-0" />
          </div>
          <Button type="submit">Apply</Button>
        </form>

        <div className="mb-8 flex flex-wrap gap-3">
          <Select value={search.status ?? "all"} onValueChange={(v) => update({ status: v as Search["status"] })}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="found">Found</SelectItem>
            </SelectContent>
          </Select>
          <Select value={search.category ?? "__all"} onValueChange={(v) => update({ category: v === "__all" ? undefined : v })}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={search.sort ?? "newest"} onValueChange={(v) => update({ sort: v as Search["sort"] })}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="soft-card overflow-hidden">
                <div className="aspect-[4/3] animate-pulse bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        ) : (
          <EmptyState
            title="No matches"
            description="Try clearing filters or posting an item to start the search."
            action={<Button asChild><Link to="/post">Post an item</Link></Button>}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}