import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Plus, LogOut, LayoutDashboard, Compass, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Compass className="h-5 w-5" />
          </div>
          <span className="font-display text-2xl leading-none">FindIt</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/browse" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Browse
          </Link>
          <Link to="/browse" search={{ status: "lost" } as any} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Lost
          </Link>
          <Link to="/browse" search={{ status: "found" } as any} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Found
          </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/post"><Plus className="mr-2 h-4 w-4" />Post item</Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="glass mx-auto mt-2 max-w-6xl rounded-2xl p-4 md:hidden flex flex-col gap-2">
          <Link to="/browse" onClick={() => setOpen(false)} className="px-2 py-2 text-sm">Browse</Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="px-2 py-2 text-sm">Dashboard</Link>
              <Link to="/post" onClick={() => setOpen(false)} className="px-2 py-2 text-sm">Post item</Link>
              <button onClick={handleSignOut} className="px-2 py-2 text-sm text-left">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="px-2 py-2 text-sm">Sign in</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="px-2 py-2 text-sm">Get started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}