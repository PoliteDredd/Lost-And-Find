import type { ReactNode } from "react";
import { SearchX } from "lucide-react";

export function EmptyState({
  title = "Nothing here yet",
  description,
  action,
  icon,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="glass mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl p-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground">
        {icon ?? <SearchX className="h-5 w-5" />}
      </div>
      <h3 className="font-display text-2xl">{title}</h3>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}