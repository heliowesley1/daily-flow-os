import type { AppState } from "@/types";
import type { PersistenceAdapter } from "./persistence";
import { api } from "./api";
import { parseBackup } from "./backup";

export class ServerAdapter implements PersistenceAdapter {
  private revision = 0;
  private queue: Promise<void> = Promise.resolve();
  private conflict = false;
  async load(): Promise<AppState | null> {
    const result = await api<{ state: unknown; revision: number }>("state");
    this.revision = result.revision;
    return result.state ? parseBackup(JSON.stringify(result.state)) : null;
  }
  save(state: AppState): Promise<void> {
    this.queue = this.queue
      .catch(() => {})
      .then(async () => {
        if (this.conflict)
          throw new Error(
            "Este espaço foi alterado em outro dispositivo. Exporte um backup e recarregue antes de continuar.",
          );
        try {
          const result = await api<{ revision: number }>("state", {
            method: "PUT",
            body: { state, revision: this.revision },
          });
          this.revision = result.revision;
        } catch (error) {
          if (error instanceof Error && "status" in error && error.status === 409)
            this.conflict = true;
          throw error;
        }
      });
    return this.queue;
  }
  async clear(): Promise<void> {
    throw new Error("Use Limpar meu espaço nas configurações.");
  }
}
