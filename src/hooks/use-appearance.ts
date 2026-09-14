import { useEffect } from "react";

import { ACCENTS } from "@/lib/tones";
import { useApp } from "@/stores/app-store";

/** Aplica tema (claro/escuro/sistema) e a cor de destaque escolhida. */
export function useAppearance() {
  const { state } = useApp();
  const { theme, accent } = state.preferences;

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      root.classList.toggle("dark", dark);
      const preset = ACCENTS[accent];
      const primary = dark ? `color-mix(in oklch, ${preset.primary} 74%, white)` : preset.primary;
      root.style.setProperty("--primary", primary);
      root.style.setProperty(
        "--primary-soft",
        dark ? `color-mix(in oklch, ${preset.primary} 19%, var(--card))` : preset.soft,
      );
      root.style.setProperty("--accent", "var(--primary-soft)");
      root.style.setProperty("--accent-foreground", primary);
      root.style.setProperty("--primary-foreground", dark ? "oklch(0.16 0.02 280)" : "white");
    };

    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme, accent]);
}
