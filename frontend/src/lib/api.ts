const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3333").replace(/\/$/, "");

export type ContentEntry<T = unknown> = {
  key: string;
  value: T;
  updatedAt: string;
};

export async function getContent<T>(key: string, signal?: AbortSignal): Promise<ContentEntry<T> | null> {
  const response = await fetch(`${API_URL}/api/content/${encodeURIComponent(key)}`, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Não foi possível carregar o conteúdo.");

  return response.json() as Promise<ContentEntry<T>>;
}
