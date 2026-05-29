import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ItemForm } from "@/components/ItemForm";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/items/$id/edit")({
  component: EditItemPage,
});

function EditItemPage() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["item-edit", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*, item_images(id, url, position)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as any;
    },
  });

  return (
    <div className="min-h-screen hero-bg">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 pt-12 pb-24">
        <h1 className="font-display text-5xl mb-6">Edit item</h1>
        {isLoading || !data ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <ItemForm
            initial={{
              id: data.id,
              title: data.title,
              description: data.description,
              category: data.category,
              status: data.status,
              event_date: data.event_date,
              location: data.location,
              contact_info: data.contact_info,
              reward: data.reward,
              tags: data.tags,
              images: (data.item_images ?? []).sort((a: any, b: any) => a.position - b.position),
            }}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}