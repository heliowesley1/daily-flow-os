export const remoteEnabled = import.meta.env?.["VITE_STORAGE_MODE"] === "server";
let csrf = "";
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
export interface Session {
  authenticated: boolean;
  setupRequired: boolean;
  csrf: string;
  user?: { name: string; email: string };
}
export async function api<T = unknown>(
  action: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const endpoint = new URL("api/index.php", document.baseURI);
  endpoint.searchParams.set("action", action);
  const response = await fetch(endpoint, {
    method: options.method ?? "GET",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });
  const body = await response.json().catch(() => ({
    error: "O servidor não retornou uma resposta válida. Confira a instalação do PHP.",
  }));
  if (!response.ok)
    throw new ApiError(body.error ?? "Não foi possível concluir a operação.", response.status);
  if (typeof body.csrf === "string") csrf = body.csrf;
  return body as T;
}
