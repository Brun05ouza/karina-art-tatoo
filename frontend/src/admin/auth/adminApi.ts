const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3333").replace(/\/$/, "");

export type AdminUser = { email: string; role: "admin" };
export type SessionResponse = {
  authenticated: boolean;
  user?: AdminUser;
  devLoginAvailable: boolean;
};

type ApiOptions = RequestInit & { allowUnauthorized?: boolean };

export async function adminFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { allowUnauthorized = false, headers, ...requestOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(requestOptions.body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
  });

  if (response.status === 401 && !allowUnauthorized) {
    window.dispatchEvent(new CustomEvent("ksa:unauthorized"));
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error || "Não foi possível concluir a operação.");
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function getAdminSession() {
  return adminFetch<SessionResponse>("/api/admin/session", { allowUnauthorized: true });
}

export function loginAdmin(email: string, password: string) {
  return adminFetch<SessionResponse>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    allowUnauthorized: true,
  });
}

export function loginAdminDevelopment() {
  if (!import.meta.env.DEV) {
    throw new Error("Acesso local indisponível.");
  }
  return adminFetch<SessionResponse>("/api/admin/dev-login", {
    method: "POST",
    allowUnauthorized: true,
  });
}

export function logoutAdmin() {
  return adminFetch<void>("/api/admin/logout", { method: "POST", allowUnauthorized: true });
}
