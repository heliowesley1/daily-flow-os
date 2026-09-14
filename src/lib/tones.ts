import type { AccentKey, CategoryTone, Priority } from "@/types";

/** Classes estáticas por tom — evita classes dinâmicas não compiladas. */
export const TONE_CLASSES: Record<CategoryTone, { dot: string; chip: string; bar: string }> = {
  primary: {
    dot: "bg-primary",
    chip: "bg-primary/10 text-primary",
    bar: "bg-primary",
  },
  success: {
    dot: "bg-success",
    chip: "bg-success/10 text-success",
    bar: "bg-success",
  },
  warning: {
    dot: "bg-warning",
    chip: "bg-warning/12 text-warning",
    bar: "bg-warning",
  },
  "chart-4": {
    dot: "bg-chart-4",
    chip: "bg-chart-4/12 text-chart-4",
    bar: "bg-chart-4",
  },
  "chart-5": {
    dot: "bg-chart-5",
    chip: "bg-chart-5/12 text-chart-5",
    bar: "bg-chart-5",
  },
  muted: {
    dot: "bg-muted-foreground/60",
    chip: "bg-muted text-muted-foreground",
    bar: "bg-muted-foreground/60",
  },
};

export const TONE_OPTIONS: { tone: CategoryTone; label: string }[] = [
  { tone: "primary", label: "Azul" },
  { tone: "success", label: "Verde" },
  { tone: "warning", label: "Âmbar" },
  { tone: "chart-4", label: "Violeta" },
  { tone: "chart-5", label: "Coral" },
  { tone: "muted", label: "Neutro" },
];

export const PRIORITY_CLASSES: Record<Priority, string> = {
  urgente: "bg-destructive/10 text-destructive",
  alta: "bg-warning/12 text-warning",
  media: "bg-muted text-muted-foreground",
  baixa: "bg-muted/60 text-muted-foreground",
};

export const ACCENTS: Record<
  AccentKey,
  { label: string; primary: string; soft: string; swatch: string }
> = {
  frost: {
    label: "Frost",
    primary: "oklch(0.545 0.184 262)",
    soft: "oklch(0.938 0.031 258)",
    swatch: "bg-[oklch(0.545_0.184_262)]",
  },
  sage: {
    label: "Sage",
    primary: "oklch(0.585 0.118 165)",
    soft: "oklch(0.94 0.03 165)",
    swatch: "bg-[oklch(0.585_0.118_165)]",
  },
  amber: {
    label: "Âmbar",
    primary: "oklch(0.645 0.135 62)",
    soft: "oklch(0.945 0.035 70)",
    swatch: "bg-[oklch(0.645_0.135_62)]",
  },
  rose: {
    label: "Rosé",
    primary: "oklch(0.585 0.175 15)",
    soft: "oklch(0.945 0.028 15)",
    swatch: "bg-[oklch(0.585_0.175_15)]",
  },
  violet: {
    label: "Violeta",
    primary: "oklch(0.545 0.185 300)",
    soft: "oklch(0.945 0.03 300)",
    swatch: "bg-[oklch(0.545_0.185_300)]",
  },
  graphite: {
    label: "Grafite",
    primary: "oklch(0.32 0.02 264)",
    soft: "oklch(0.93 0.006 264)",
    swatch: "bg-[oklch(0.32_0.02_264)]",
  },
};
