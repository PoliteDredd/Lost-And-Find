import { Link } from "@tanstack/react-router";
import { MapPin, Calendar } from "lucide-react";
import { CATEGORY_ICONS, type Category } from "@/lib/categories";
import { format } from "date-fns";

export interface ItemCardData {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "lost" | "found";
  location: string;
  event_date: string;
  is_resolved: boolean;
  cover_url?: string | null;
}

export function ItemCard({ item }: { item: ItemCardData }) {
  const icon = CATEGORY_ICONS[item.category as Category] ?? "📦";
  return (
    <Link
      to="/items/$id"
      params={{ id: item.id }}
      className="soft-card group block overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {item.cover_url ? (
          <img
            src={item.cover_url}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl opacity-60">
            {icon}
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wider ${
              item.status === "lost"
                ? "bg-lost text-lost-foreground"
                : "bg-found text-found-foreground"
            }`}
          >
            {item.status}
          </span>
          {item.is_resolved && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
              Resolved
            </span>
          )}
        </div>
      </div>
      <div className="p-5">
        <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{icon}</span>
          <span>{item.category}</span>
        </div>
        <h3 className="font-display text-xl leading-tight mb-2 line-clamp-1">
          {item.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{item.description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate max-w-[140px]">{item.location}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(item.event_date), "MMM d, yyyy")}
          </span>
        </div>
      </div>
    </Link>
  );
}