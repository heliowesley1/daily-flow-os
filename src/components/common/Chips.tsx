import { cn } from "@/lib/utils";
import { PRIORITY_CLASSES, TONE_CLASSES } from "@/lib/tones";
import { PRIORITY_LABEL } from "@/lib/tasks";
import type { Category, Priority } from "@/types";

export function CategoryChip({ category, className }: { category: Category | null; className?: string }) {
  if (!category) return null;
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        TONE_CLASSES[category.tone].chip,
        className,
      )}
    >
      {category.name}
    </span>
  );
}

export function PriorityChip({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-[11px] font-semibold",
        priority === "urgente"
          ? "bg-primary text-primary-foreground"
          : PRIORITY_CLASSES[priority],
        className,
      )}
    >
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

export function ToneDot({ tone, className }: { tone: Category["tone"]; className?: string }) {
  return <span className={cn("size-2 shrink-0 rounded-full", TONE_CLASSES[tone].dot, className)} />;
}
