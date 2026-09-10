import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SurfaceCardProps {
  title?: string;
  meta?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function SurfaceCard({ title, meta, action, className, children }: SurfaceCardProps) {
  return (
    <section className={cn("surface p-5", className)}>
      {(title || meta || action) && (
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h2 className="truncate text-[13px] font-bold uppercase tracking-wider text-foreground/70">
            {title}
          </h2>
          <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-muted-foreground">
            {meta}
            {action}
          </div>
        </div>
      )}
      {children}
    </section>
  );
}
