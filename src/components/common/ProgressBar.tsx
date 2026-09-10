import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  barClassName?: string;
}

export function ProgressBar({ value, className, barClassName }: ProgressBarProps) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-foreground/8", className)}>
      <div
        className={cn(
          "h-full rounded-full bg-primary transition-[width] duration-700 ease-out",
          barClassName,
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function RingProgress({ value, label }: { value: number; label?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className="relative grid size-16 shrink-0 place-items-center rounded-full"
      style={{
        background: `conic-gradient(var(--color-primary) ${clamped}%, var(--color-muted) ${clamped}% 100%)`,
      }}
    >
      <div className="grid size-12 place-items-center rounded-full bg-card">
        <span className="text-sm font-bold tabular-nums">{label ?? `${clamped}%`}</span>
      </div>
    </div>
  );
}
