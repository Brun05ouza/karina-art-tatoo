/** Chamadas à API admin — sempre com cookies de sessão. */

export type AdminRole = "owner" | "editor";

export type AdminSessionUser = {
  id: string;
  email: string;
  role: AdminRole;
  mustChangePassword: boolean;
  lastLoginAt?: string | null;
};

export type SessionResponse =
  | { authenticated: false }
  | {
      authenticated: true;
      mustChangePassword: boolean;
      user: AdminSessionUser;
    };

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(path, {
    ...init,
    headers,
    credentials: "include",
  });

  const data = await parseJson(res);
  if (!res.ok) {
    const message =
      typeof data.error === "string" ? data.error : "Algo deu errado. Tente de novo.";
    throw new ApiError(message, res.status);
  }
  return data as T;
}

export function login(email: string, password: string) {
  return request<{
    ok: true;
    mustChangePassword: boolean;
    user: AdminSessionUser;
  }>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return request<{ ok: true }>("/api/admin/logout", { method: "POST" });
}

export function fetchSession() {
  return request<SessionResponse>("/api/admin/session");
}

export function changePassword(input: {
  currentPassword?: string;
  newPassword: string;
}) {
  return request<{
    ok: true;
    mustChangePassword: boolean;
    user: AdminSessionUser;
  }>("/api/admin/password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type ListedUser = {
  id: string;
  email: string;
  role: AdminRole;
  active: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt?: string;
};

export function listUsers() {
  return request<{ users: ListedUser[] }>("/api/admin/users");
}

export function createUser(email: string, role: AdminRole) {
  return request<{
    ok: true;
    temporaryPassword: string;
    notice: string;
    user: ListedUser;
  }>("/api/admin/users", {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
}

export function setUserActive(id: string, active: boolean) {
  return request<{ ok: true; user: ListedUser }>(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}
