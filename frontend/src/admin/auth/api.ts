/** Chamadas à API admin — sempre com cookies de sessão. */

function isLocalAdminHost(): boolean {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

/** Mensagem de falha de rede: técnica em dev, humana em produção. */
function apiUnreachableMessage(kind: "timeout" | "network"): string {
  if (isLocalAdminHost()) {
    return kind === "timeout"
      ? "A API não respondeu. Rode `npm run dev` na raiz do projeto (API na porta 8788)."
      : "Não foi possível conectar à API. Confira se o `npm run dev` está rodando (porta 8788).";
  }
  return "Não conseguimos conectar agora. Tente de novo em instantes.";
}

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
      throw new ApiError(apiUnreachableMessage("timeout"), 0);
    }
    throw new ApiError(apiUnreachableMessage("network"), 0);
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

export function deleteUser(id: string) {
  return request<{ ok: true; id: string; email: string }>(`/api/admin/users/${id}`, {
    method: "DELETE",
  });
}

export type GalleryCollectionId = "portfolio" | "flash" | "produtos" | "reformulacoes";

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
  featured: boolean;
  show_in_recent: boolean;
  focal_x: number;
  focal_y: number;
  after_image_url: string | null;
  after_image_key: string | null;
  after_focal_x: number;
  after_focal_y: number;
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

export type BioProfile = {
  id: number;
  avatar_url: string;
  avatar_key: string | null;
  subtitle: string;
  studio_image_url: string;
  studio_image_key: string | null;
  cover_image_url: string;
  cover_image_key: string | null;
  avatar_focal_x: number;
  avatar_focal_y: number;
  studio_focal_x: number;
  studio_focal_y: number;
  cover_focal_x: number;
  cover_focal_y: number;
  show_site_footer: boolean;
  created_at: string;
  updated_at: string;
};

export type BioStyleChip = {
  id: string;
  label: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type BioTestimonial = {
  id: string;
  quote: string;
  author: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type BioProfileBundle = {
  profile: BioProfile;
  chips: BioStyleChip[];
  testimonials: BioTestimonial[];
};

export function getBioProfile() {
  return request<BioProfileBundle>("/api/admin/bio-profile");
}

export function patchBioProfile(body: Record<string, unknown>) {
  return request<{ ok: true; profile: BioProfile }>("/api/admin/bio-profile", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function listBioChips() {
  return request<{ items: BioStyleChip[] }>("/api/admin/bio-chips");
}

export function createBioChip(body: Record<string, unknown>) {
  return request<{ ok: true; item: BioStyleChip }>("/api/admin/bio-chips", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function patchBioChip(id: string, body: Record<string, unknown>) {
  return request<{ ok: true; item: BioStyleChip }>(`/api/admin/bio-chips/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteBioChip(id: string) {
  return request<{ ok: true; id: string }>(`/api/admin/bio-chips/${id}`, {
    method: "DELETE",
  });
}

export function reorderBioChips(ids: string[]) {
  return request<{ ok: true }>("/api/admin/bio-chips/reorder", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export function listBioTestimonials() {
  return request<{ items: BioTestimonial[] }>("/api/admin/bio-testimonials");
}

export function createBioTestimonial(body: Record<string, unknown>) {
  return request<{ ok: true; item: BioTestimonial }>("/api/admin/bio-testimonials", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function patchBioTestimonial(id: string, body: Record<string, unknown>) {
  return request<{ ok: true; item: BioTestimonial }>(
    `/api/admin/bio-testimonials/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}

export function deleteBioTestimonial(id: string) {
  return request<{ ok: true; id: string }>(`/api/admin/bio-testimonials/${id}`, {
    method: "DELETE",
  });
}

export function reorderBioTestimonials(ids: string[]) {
  return request<{ ok: true }>("/api/admin/bio-testimonials/reorder", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export type AboutMediaSlot = {
  url: string;
  key: string;
  focalX: number;
  focalY: number;
};

export type AboutMediaSlotId =
  | "heroImage"
  | "image"
  | "behindScenesImage"
  | "studioInviteImage"
  | "studioTour0"
  | "studioTour1"
  | "studioTour2"
  | "studioTour3";

export type AboutMediaBundle = {
  heroImage: AboutMediaSlot;
  image: AboutMediaSlot;
  behindScenesImage: AboutMediaSlot;
  studioInviteImage: AboutMediaSlot;
  studioTourSteps: AboutMediaSlot[];
  hiddenSections: string[];
};

export type AdminSettings = {
  whatsappPhone: string;
  whatsappPhoneDisplay: string;
  developmentMode: boolean;
  youtubeVisible: boolean;
  youtubeUrl: string;
  youtubeThumbUrl: string;
  youtubeThumbKey: string;
  youtubeTrailerUrl: string;
  youtubeTrailerKey: string;
  productsHeroImageUrl: string;
  productsHeroImageKey: string;
  productsHeroFocalX: number;
  productsHeroFocalY: number;
  aboutMedia: AboutMediaBundle;
};

const EMPTY_ABOUT_SLOT: AboutMediaSlot = {
  url: "",
  key: "",
  focalX: 50,
  focalY: 50,
};

export const EMPTY_ABOUT_MEDIA: AboutMediaBundle = {
  heroImage: { ...EMPTY_ABOUT_SLOT },
  image: { ...EMPTY_ABOUT_SLOT },
  behindScenesImage: { ...EMPTY_ABOUT_SLOT },
  studioInviteImage: { ...EMPTY_ABOUT_SLOT },
  studioTourSteps: [
    { ...EMPTY_ABOUT_SLOT },
    { ...EMPTY_ABOUT_SLOT },
    { ...EMPTY_ABOUT_SLOT },
    { ...EMPTY_ABOUT_SLOT },
  ],
  hiddenSections: [],
};

export function getAdminSettings() {
  return request<AdminSettings>("/api/admin/settings");
}

export function patchAdminSettings(body: {
  whatsappPhone?: string;
  developmentMode?: boolean;
  youtubeVisible?: boolean;
  youtubeUrl?: string;
  youtubeThumbUrl?: string;
  youtubeThumbKey?: string;
  youtubeTrailerUrl?: string;
  youtubeTrailerKey?: string;
  clearYoutubeThumb?: boolean;
  clearYoutubeTrailer?: boolean;
  productsHeroImageUrl?: string;
  productsHeroImageKey?: string;
  productsHeroFocalX?: number;
  productsHeroFocalY?: number;
  clearProductsHeroImage?: boolean;
  aboutMediaSlot?: {
    id: AboutMediaSlotId;
    url?: string;
    key?: string;
    focalX?: number;
    focalY?: number;
  };
  clearAboutMediaSlot?: AboutMediaSlotId;
  aboutHiddenSection?: { id: string; hidden: boolean };
}) {
  return request<AdminSettings & { ok: true }>("/api/admin/settings", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
