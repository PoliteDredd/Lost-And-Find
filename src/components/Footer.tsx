import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Compass className="h-4 w-4" />
          </div>
          <span className="font-display text-xl">FindIt</span>
          <span className="text-xs text-muted-foreground ml-2">Reunited, the easy way.</span>
        </div>
        <nav className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <Link to="/browse" className="hover:text-foreground">Browse</Link>
          <Link to="/post" className="hover:text-foreground">Post an item</Link>
          <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
        </nav>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} FindIt</p>
      </div>
    </footer>
  );
}