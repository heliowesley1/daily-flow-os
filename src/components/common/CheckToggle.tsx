import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface CheckToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  shape?: "square" | "circle";
  size?: "sm" | "md";
  className?: string;
}

export function CheckToggle({
  checked,
  onChange,
  label,
  shape = "square",
  size = "md",
  className,
}: CheckToggleProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        "grid shrink-0 place-items-center border-2 transition-all duration-200",
        shape === "circle" ? "rounded-full" : "rounded-md",
        size === "sm" ? "size-5" : "size-6",
        checked
          ? "border-success bg-success text-success-foreground"
          : "border-foreground/20 text-transparent hover:border-primary",
        className,
      )}
    >
      <Check
        className={cn(size === "sm" ? "size-3" : "size-3.5", checked && "pop")}
        strokeWidth={3}
      />
    </button>
  );
}
