import type { AppState } from "@/types";
import { parseBackup } from "./backup";

/**
 * Camada de abstração de persistência.
 * Hoje: localStorage. Futuro: adaptador Supabase/API sem tocar na UI.
 */
export interface PersistenceAdapter {
  load(): Promise<AppState | null>;
  save(state: AppState): Promise<void>;
  clear(): Promise<void>;
}

const KEY = "focal.state.v1";

export class LocalStorageAdapter implements PersistenceAdapter {
  async load(): Promise<AppState | null> {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      return parseBackup(raw);
    } catch {
      throw new Error("Não foi possível ler os dados locais.");
    }
  }

  async save(state: AppState): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(state));
  }

  async clear(): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(KEY);
  }
}

export const persistence: PersistenceAdapter = new LocalStorageAdapter();

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
