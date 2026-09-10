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
    };

    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const preset = ACCENTS[accent];
    root.style.setProperty("--primary", preset.primary);
    root.style.setProperty("--primary-soft", preset.soft);
    root.style.setProperty("--accent", preset.soft);
    root.style.setProperty("--accent-foreground", preset.primary);
  }, [accent]);
}
