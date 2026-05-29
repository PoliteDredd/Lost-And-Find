import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ItemForm } from "@/components/ItemForm";

export const Route = createFileRoute("/_authenticated/post")({
  head: () => ({ meta: [{ title: "Post an item — FindIt" }] }),
  component: PostPage,
});

function PostPage() {
  return (
    <div className="min-h-screen hero-bg">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 pt-12 pb-24">
        <h1 className="font-display text-5xl md:text-6xl mb-2">Post an item</h1>
        <p className="text-muted-foreground mb-8">Share what you lost or found. Be specific — details lead to reunions.</p>
        <ItemForm />
      </div>
      <Footer />
    </div>
  );
}