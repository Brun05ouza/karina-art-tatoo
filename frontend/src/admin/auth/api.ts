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

  const timeoutMs = 12_000;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  if (init.signal) {
    if (init.signal.aborted) controller.abort();
    else {
      init.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }

  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers,
      credentials: "include",
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("A API não respondeu. Confira se o pages:dev está rodando (porta 8788).", 0);
    }
    throw new ApiError("Não foi possível conectar à API.", 0);
  } finally {
    window.clearTimeout(timer);
  }

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

export type GalleryCollectionId = "portfolio" | "flash" | "produtos";

export type GalleryItem = {
  id: string;
  collection: GalleryCollectionId;
  title: string;
  category: string | null;
  price: string | null;
  link: string | null;
  status: string | null;
  image_url: string;
  image_key: string;
  alt_text: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export function listGallery(collection: GalleryCollectionId) {
  return request<{ collection: string; items: GalleryItem[] }>(
    `/api/admin/gallery/${collection}`,
  );
}

export function createGalleryItem(
  collection: GalleryCollectionId,
  body: Record<string, unknown>,
) {
  return request<{ ok: true; item: GalleryItem }>(`/api/admin/gallery/${collection}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function patchGalleryItem(id: string, body: Record<string, unknown>) {
  return request<{ ok: true; item: GalleryItem }>(`/api/admin/gallery/item/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteGalleryItem(id: string) {
  return request<{ ok: true; id: string }>(`/api/admin/gallery/item/${id}`, {
    method: "DELETE",
  });
}

export function reorderGallery(collection: GalleryCollectionId, ids: string[]) {
  return request<{ ok: true }>(`/api/admin/gallery/${collection}/reorder`, {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export type BioKindId = "whatsapp" | "external" | "internal";

export type BioIconId =
  | "whatsapp"
  | "tiktok"
  | "youtube"
  | "instagram"
  | "portfolio"
  | "produtos"
  | "link";

export type BioLinkItem = {
  id: string;
  label: string;
  kind: BioKindId;
  url: string;
  message: string | null;
  icon: BioIconId | null;
  featured: boolean;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export function listBioLinks() {
  return request<{ items: BioLinkItem[] }>("/api/admin/bio-links");
}

export function createBioLink(body: Record<string, unknown>) {
  return request<{ ok: true; item: BioLinkItem }>("/api/admin/bio-links", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function patchBioLink(id: string, body: Record<string, unknown>) {
  return request<{ ok: true; item: BioLinkItem }>(`/api/admin/bio-links/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteBioLink(id: string) {
  return request<{ ok: true; id: string }>(`/api/admin/bio-links/${id}`, {
    method: "DELETE",
  });
}

export function reorderBioLinks(ids: string[]) {
  return request<{ ok: true }>("/api/admin/bio-links/reorder", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export function getAdminSettings() {
  return request<{ whatsappPhone: string; whatsappPhoneDisplay: string }>("/api/admin/settings");
}

export function patchAdminSettings(body: { whatsappPhone: string }) {
  return request<{ ok: true; whatsappPhone: string; whatsappPhoneDisplay: string }>(
    "/api/admin/settings",
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}
