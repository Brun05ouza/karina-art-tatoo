/** Tipos, validação e queries de bio_profile / bio_style_chips / bio_testimonials. */

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { requireEnv, type Env } from "./config";

export type BioProfile = {
  id: number;
  avatar_url: string;
  avatar_key: string | null;
  subtitle: string;
  studio_image_url: string;
  studio_image_key: string | null;
  avatar_focal_x: number;
  avatar_focal_y: number;
  studio_focal_x: number;
  studio_focal_y: number;
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

function sql(env: Env): NeonQueryFunction<false, false> {
  return neon(requireEnv(env, "DATABASE_URL"));
}

function trimStr(value: unknown, max: number): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  return s.slice(0, max);
}

function clampFocalValue(value: unknown): number | typeof Number.NaN {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return Number.NaN;
  const rounded = Math.round(n);
  if (rounded < 0 || rounded > 100) return Number.NaN;
  return rounded;
}

function mapFocal(row: Record<string, unknown>, key: string): number {
  const n = Number(row[key]);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 50;
}

function mapProfile(row: Record<string, unknown>): BioProfile {
  return {
    id: Number(row.id) || 1,
    avatar_url: String(row.avatar_url ?? ""),
    avatar_key: row.avatar_key != null && String(row.avatar_key).trim() ? String(row.avatar_key) : null,
    subtitle: String(row.subtitle ?? ""),
    studio_image_url: String(row.studio_image_url ?? ""),
    studio_image_key:
      row.studio_image_key != null && String(row.studio_image_key).trim()
        ? String(row.studio_image_key)
        : null,
    avatar_focal_x: mapFocal(row, "avatar_focal_x"),
    avatar_focal_y: mapFocal(row, "avatar_focal_y"),
    studio_focal_x: mapFocal(row, "studio_focal_x"),
    studio_focal_y: mapFocal(row, "studio_focal_y"),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function mapChip(row: Record<string, unknown>): BioStyleChip {
  return {
    id: String(row.id),
    label: String(row.label),
    sort_order: Number(row.sort_order) || 0,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function mapTestimonial(row: Record<string, unknown>): BioTestimonial {
  return {
    id: String(row.id),
    quote: String(row.quote),
    author: row.author != null && String(row.author).trim() ? String(row.author) : null,
    sort_order: Number(row.sort_order) || 0,
    published: Boolean(row.published),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

// —— Profile ————————————————————————————————————————————————

export type BioProfilePatchInput = Partial<{
  avatar_url: string;
  avatar_key: string | null;
  subtitle: string;
  studio_image_url: string;
  studio_image_key: string | null;
  avatar_focal_x: number;
  avatar_focal_y: number;
  studio_focal_x: number;
  studio_focal_y: number;
}>;

export function validateProfilePatch(
  body: Record<string, unknown>,
): { ok: true; value: BioProfilePatchInput } | { ok: false; message: string } {
  const patch: BioProfilePatchInput = {};

  if ("subtitle" in body) {
    const raw = typeof body.subtitle === "string" ? body.subtitle.trim() : "";
    if (!raw) return { ok: false, message: "Informe o subtítulo." };
    if (raw.length > 80) {
      return { ok: false, message: "Subtítulo deve ter no máximo 80 caracteres." };
    }
    patch.subtitle = raw;
  }

  if ("avatar_url" in body) {
    const avatar_url = trimStr(body.avatar_url, 2000);
    if (!avatar_url) return { ok: false, message: "Informe a URL do avatar." };
    patch.avatar_url = avatar_url;
    patch.avatar_focal_x = 50;
    patch.avatar_focal_y = 50;
  }

  if ("avatar_key" in body) {
    if (body.avatar_key == null || String(body.avatar_key).trim() === "") {
      patch.avatar_key = null;
    } else {
      const key = trimStr(body.avatar_key, 500);
      if (!key) return { ok: false, message: "avatar_key inválido." };
      patch.avatar_key = key;
    }
  }

  if ("studio_image_url" in body) {
    const studio_image_url = trimStr(body.studio_image_url, 2000);
    if (!studio_image_url) return { ok: false, message: "Informe a URL da imagem do studio." };
    patch.studio_image_url = studio_image_url;
    patch.studio_focal_x = 50;
    patch.studio_focal_y = 50;
  }

  if ("studio_image_key" in body) {
    if (body.studio_image_key == null || String(body.studio_image_key).trim() === "") {
      patch.studio_image_key = null;
    } else {
      const key = trimStr(body.studio_image_key, 500);
      if (!key) return { ok: false, message: "studio_image_key inválido." };
      patch.studio_image_key = key;
    }
  }

  const focalFields = [
    ["avatarFocalX", "avatar_focal_x", "avatar_focal_x"],
    ["avatarFocalY", "avatar_focal_y", "avatar_focal_y"],
    ["studioFocalX", "studio_focal_x", "studio_focal_x"],
    ["studioFocalY", "studio_focal_y", "studio_focal_y"],
  ] as const;

  for (const [camel, snake, key] of focalFields) {
    if (!(camel in body) && !(snake in body)) continue;
    const raw = camel in body ? body[camel] : body[snake];
    const parsed = clampFocalValue(raw);
    if (Number.isNaN(parsed)) {
      return { ok: false, message: `${camel} deve ser um inteiro entre 0 e 100.` };
    }
    patch[key] = parsed;
  }

  if (Object.keys(patch).length === 0) {
    return { ok: false, message: "Nenhum campo para atualizar." };
  }
  return { ok: true, value: patch };
}

export async function getProfile(env: Env): Promise<BioProfile | null> {
  const db = sql(env);
  const rows = await db`
    SELECT id, avatar_url, avatar_key, subtitle, studio_image_url, studio_image_key,
           avatar_focal_x, avatar_focal_y, studio_focal_x, studio_focal_y,
           created_at, updated_at
    FROM bio_profile
    WHERE id = 1
    LIMIT 1
  `;
  if (!rows[0]) return null;
  return mapProfile(rows[0] as Record<string, unknown>);
}

export async function updateProfile(
  env: Env,
  patch: BioProfilePatchInput,
): Promise<BioProfile | null> {
  const current = await getProfile(env);
  if (!current) return null;

  const avatarChanged = Boolean(patch.avatar_url);
  const studioChanged = Boolean(patch.studio_image_url);

  const next = {
    avatar_url: patch.avatar_url ?? current.avatar_url,
    avatar_key: patch.avatar_key !== undefined ? patch.avatar_key : current.avatar_key,
    subtitle: patch.subtitle ?? current.subtitle,
    studio_image_url: patch.studio_image_url ?? current.studio_image_url,
    studio_image_key:
      patch.studio_image_key !== undefined ? patch.studio_image_key : current.studio_image_key,
    avatar_focal_x:
      avatarChanged && patch.avatar_focal_x === undefined
        ? 50
        : (patch.avatar_focal_x ?? current.avatar_focal_x),
    avatar_focal_y:
      avatarChanged && patch.avatar_focal_y === undefined
        ? 50
        : (patch.avatar_focal_y ?? current.avatar_focal_y),
    studio_focal_x:
      studioChanged && patch.studio_focal_x === undefined
        ? 50
        : (patch.studio_focal_x ?? current.studio_focal_x),
    studio_focal_y:
      studioChanged && patch.studio_focal_y === undefined
        ? 50
        : (patch.studio_focal_y ?? current.studio_focal_y),
  };

  const db = sql(env);
  const rows = await db`
    UPDATE bio_profile SET
      avatar_url = ${next.avatar_url},
      avatar_key = ${next.avatar_key},
      subtitle = ${next.subtitle},
      studio_image_url = ${next.studio_image_url},
      studio_image_key = ${next.studio_image_key},
      avatar_focal_x = ${next.avatar_focal_x},
      avatar_focal_y = ${next.avatar_focal_y},
      studio_focal_x = ${next.studio_focal_x},
      studio_focal_y = ${next.studio_focal_y},
      updated_at = NOW()
    WHERE id = 1
    RETURNING id, avatar_url, avatar_key, subtitle, studio_image_url, studio_image_key,
              avatar_focal_x, avatar_focal_y, studio_focal_x, studio_focal_y,
              created_at, updated_at
  `;
  if (!rows[0]) return null;
  return mapProfile(rows[0] as Record<string, unknown>);
}

export async function getPublicBundle(env: Env): Promise<BioProfileBundle> {
  const profile = await getProfile(env);
  if (!profile) {
    throw new Error("bio_profile não encontrado. Rode a migration 005.");
  }
  const chips = await listChips(env);
  const testimonials = await listPublishedTestimonials(env);
  return { profile, chips, testimonials };
}

export async function getAdminBundle(env: Env): Promise<BioProfileBundle> {
  const profile = await getProfile(env);
  if (!profile) {
    throw new Error("bio_profile não encontrado. Rode a migration 005.");
  }
  const chips = await listChips(env);
  const testimonials = await listAllTestimonials(env);
  return { profile, chips, testimonials };
}

// —— Chips ————————————————————————————————————————————————

export type BioChipCreateInput = {
  label: string;
  sort_order: number | null;
};

export type BioChipPatchInput = Partial<{
  label: string;
  sort_order: number;
}>;

export function validateChipCreate(
  body: Record<string, unknown>,
): { ok: true; value: BioChipCreateInput } | { ok: false; message: string } {
  const raw = typeof body.label === "string" ? body.label.trim() : "";
  if (!raw) return { ok: false, message: "Informe o rótulo." };
  if (raw.length > 30) return { ok: false, message: "Rótulo deve ter no máximo 30 caracteres." };
  const label = raw.slice(0, 30);

  const sort_order =
    typeof body.sort_order === "number" && Number.isFinite(body.sort_order)
      ? Math.trunc(body.sort_order)
      : null;

  return { ok: true, value: { label, sort_order } };
}

export function validateChipPatch(
  body: Record<string, unknown>,
): { ok: true; value: BioChipPatchInput } | { ok: false; message: string } {
  const patch: BioChipPatchInput = {};

  if ("label" in body) {
    const raw = typeof body.label === "string" ? body.label.trim() : "";
    if (!raw) return { ok: false, message: "Informe o rótulo." };
    if (raw.length > 30) return { ok: false, message: "Rótulo deve ter no máximo 30 caracteres." };
    patch.label = raw.slice(0, 30);
  }

  if ("sort_order" in body) {
    if (typeof body.sort_order !== "number" || !Number.isFinite(body.sort_order)) {
      return { ok: false, message: "sort_order inválido." };
    }
    patch.sort_order = Math.trunc(body.sort_order);
  }

  if (Object.keys(patch).length === 0) {
    return { ok: false, message: "Nenhum campo para atualizar." };
  }
  return { ok: true, value: patch };
}

export async function listChips(env: Env): Promise<BioStyleChip[]> {
  const db = sql(env);
  const rows = await db`
    SELECT id, label, sort_order, created_at, updated_at
    FROM bio_style_chips
    ORDER BY sort_order ASC, created_at ASC
  `;
  return (rows as Record<string, unknown>[]).map(mapChip);
}

export async function findChipById(env: Env, id: string): Promise<BioStyleChip | null> {
  const db = sql(env);
  const rows = await db`
    SELECT id, label, sort_order, created_at, updated_at
    FROM bio_style_chips
    WHERE id = ${id}
    LIMIT 1
  `;
  if (!rows[0]) return null;
  return mapChip(rows[0] as Record<string, unknown>);
}

export async function createChip(env: Env, input: BioChipCreateInput): Promise<BioStyleChip> {
  const db = sql(env);
  let sortOrder = input.sort_order;
  if (sortOrder == null) {
    const maxRows = await db`SELECT COALESCE(MAX(sort_order), -1)::int AS max FROM bio_style_chips`;
    sortOrder = Number((maxRows[0] as { max: number })?.max ?? -1) + 1;
  }

  const rows = await db`
    INSERT INTO bio_style_chips (label, sort_order)
    VALUES (${input.label}, ${sortOrder})
    RETURNING id, label, sort_order, created_at, updated_at
  `;
  return mapChip(rows[0] as Record<string, unknown>);
}

export async function updateChip(
  env: Env,
  id: string,
  patch: BioChipPatchInput,
): Promise<BioStyleChip | null> {
  const current = await findChipById(env, id);
  if (!current) return null;

  const next = {
    label: patch.label ?? current.label,
    sort_order: patch.sort_order ?? current.sort_order,
  };

  const db = sql(env);
  const rows = await db`
    UPDATE bio_style_chips SET
      label = ${next.label},
      sort_order = ${next.sort_order},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, label, sort_order, created_at, updated_at
  `;
  if (!rows[0]) return null;
  return mapChip(rows[0] as Record<string, unknown>);
}

export async function deleteChip(env: Env, id: string): Promise<BioStyleChip | null> {
  const db = sql(env);
  const rows = await db`
    DELETE FROM bio_style_chips
    WHERE id = ${id}
    RETURNING id, label, sort_order, created_at, updated_at
  `;
  if (!rows[0]) return null;
  return mapChip(rows[0] as Record<string, unknown>);
}

export async function reorderChips(
  env: Env,
  ids: string[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { ok: false, message: "Envie a lista de ids na nova ordem." };
  }
  if (ids.some((id) => typeof id !== "string" || !id)) {
    return { ok: false, message: "Lista de ids inválida." };
  }

  const db = sql(env);
  const existing = await db`SELECT id FROM bio_style_chips`;
  const existingIds = new Set((existing as { id: string }[]).map((r) => String(r.id)));
  if (existingIds.size !== ids.length || ids.some((id) => !existingIds.has(id))) {
    return { ok: false, message: "A lista de ids não corresponde aos chips atuais." };
  }

  for (let i = 0; i < ids.length; i++) {
    await db`
      UPDATE bio_style_chips SET sort_order = ${i}, updated_at = NOW() WHERE id = ${ids[i]!}
    `;
  }
  return { ok: true };
}

// —— Testimonials ——————————————————————————————————————————

export type BioTestimonialCreateInput = {
  quote: string;
  author: string | null;
  sort_order: number | null;
  published: boolean;
};

export type BioTestimonialPatchInput = Partial<{
  quote: string;
  author: string | null;
  sort_order: number;
  published: boolean;
}>;

export function validateTestimonialCreate(
  body: Record<string, unknown>,
): { ok: true; value: BioTestimonialCreateInput } | { ok: false; message: string } {
  const rawQuote = typeof body.quote === "string" ? body.quote.trim() : "";
  if (!rawQuote) return { ok: false, message: "Informe a citação." };
  if (rawQuote.length > 280) {
    return { ok: false, message: "Citação deve ter no máximo 280 caracteres." };
  }
  const quote = rawQuote.slice(0, 280);

  let author: string | null = null;
  if ("author" in body && body.author != null && String(body.author).trim()) {
    const rawAuthor = String(body.author).trim();
    if (rawAuthor.length > 60) {
      return { ok: false, message: "Autor deve ter no máximo 60 caracteres." };
    }
    author = rawAuthor.slice(0, 60);
  }

  const published = body.published === undefined ? true : Boolean(body.published);
  const sort_order =
    typeof body.sort_order === "number" && Number.isFinite(body.sort_order)
      ? Math.trunc(body.sort_order)
      : null;

  return { ok: true, value: { quote, author, sort_order, published } };
}

export function validateTestimonialPatch(
  body: Record<string, unknown>,
): { ok: true; value: BioTestimonialPatchInput } | { ok: false; message: string } {
  const patch: BioTestimonialPatchInput = {};

  if ("quote" in body) {
    const rawQuote = typeof body.quote === "string" ? body.quote.trim() : "";
    if (!rawQuote) return { ok: false, message: "Informe a citação." };
    if (rawQuote.length > 280) {
      return { ok: false, message: "Citação deve ter no máximo 280 caracteres." };
    }
    patch.quote = rawQuote.slice(0, 280);
  }

  if ("author" in body) {
    if (body.author == null || String(body.author).trim() === "") {
      patch.author = null;
    } else {
      const rawAuthor = String(body.author).trim();
      if (rawAuthor.length > 60) {
        return { ok: false, message: "Autor deve ter no máximo 60 caracteres." };
      }
      patch.author = rawAuthor.slice(0, 60);
    }
  }

  if ("published" in body) patch.published = Boolean(body.published);

  if ("sort_order" in body) {
    if (typeof body.sort_order !== "number" || !Number.isFinite(body.sort_order)) {
      return { ok: false, message: "sort_order inválido." };
    }
    patch.sort_order = Math.trunc(body.sort_order);
  }

  if (Object.keys(patch).length === 0) {
    return { ok: false, message: "Nenhum campo para atualizar." };
  }
  return { ok: true, value: patch };
}

export async function listPublishedTestimonials(env: Env): Promise<BioTestimonial[]> {
  const db = sql(env);
  const rows = await db`
    SELECT id, quote, author, sort_order, published, created_at, updated_at
    FROM bio_testimonials
    WHERE published = TRUE
    ORDER BY sort_order ASC, created_at ASC
  `;
  return (rows as Record<string, unknown>[]).map(mapTestimonial);
}

export async function listAllTestimonials(env: Env): Promise<BioTestimonial[]> {
  const db = sql(env);
  const rows = await db`
    SELECT id, quote, author, sort_order, published, created_at, updated_at
    FROM bio_testimonials
    ORDER BY sort_order ASC, created_at ASC
  `;
  return (rows as Record<string, unknown>[]).map(mapTestimonial);
}

export async function findTestimonialById(
  env: Env,
  id: string,
): Promise<BioTestimonial | null> {
  const db = sql(env);
  const rows = await db`
    SELECT id, quote, author, sort_order, published, created_at, updated_at
    FROM bio_testimonials
    WHERE id = ${id}
    LIMIT 1
  `;
  if (!rows[0]) return null;
  return mapTestimonial(rows[0] as Record<string, unknown>);
}

export async function createTestimonial(
  env: Env,
  input: BioTestimonialCreateInput,
): Promise<BioTestimonial> {
  const db = sql(env);
  let sortOrder = input.sort_order;
  if (sortOrder == null) {
    const maxRows = await db`SELECT COALESCE(MAX(sort_order), -1)::int AS max FROM bio_testimonials`;
    sortOrder = Number((maxRows[0] as { max: number })?.max ?? -1) + 1;
  }

  const rows = await db`
    INSERT INTO bio_testimonials (quote, author, sort_order, published)
    VALUES (${input.quote}, ${input.author}, ${sortOrder}, ${input.published})
    RETURNING id, quote, author, sort_order, published, created_at, updated_at
  `;
  return mapTestimonial(rows[0] as Record<string, unknown>);
}

export async function updateTestimonial(
  env: Env,
  id: string,
  patch: BioTestimonialPatchInput,
): Promise<BioTestimonial | null> {
  const current = await findTestimonialById(env, id);
  if (!current) return null;

  const next = {
    quote: patch.quote ?? current.quote,
    author: patch.author !== undefined ? patch.author : current.author,
    sort_order: patch.sort_order ?? current.sort_order,
    published: patch.published ?? current.published,
  };

  const db = sql(env);
  const rows = await db`
    UPDATE bio_testimonials SET
      quote = ${next.quote},
      author = ${next.author},
      sort_order = ${next.sort_order},
      published = ${next.published},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, quote, author, sort_order, published, created_at, updated_at
  `;
  if (!rows[0]) return null;
  return mapTestimonial(rows[0] as Record<string, unknown>);
}

export async function deleteTestimonial(
  env: Env,
  id: string,
): Promise<BioTestimonial | null> {
  const db = sql(env);
  const rows = await db`
    DELETE FROM bio_testimonials
    WHERE id = ${id}
    RETURNING id, quote, author, sort_order, published, created_at, updated_at
  `;
  if (!rows[0]) return null;
  return mapTestimonial(rows[0] as Record<string, unknown>);
}

export async function reorderTestimonials(
  env: Env,
  ids: string[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { ok: false, message: "Envie a lista de ids na nova ordem." };
  }
  if (ids.some((id) => typeof id !== "string" || !id)) {
    return { ok: false, message: "Lista de ids inválida." };
  }

  const db = sql(env);
  const existing = await db`SELECT id FROM bio_testimonials`;
  const existingIds = new Set((existing as { id: string }[]).map((r) => String(r.id)));
  if (existingIds.size !== ids.length || ids.some((id) => !existingIds.has(id))) {
    return { ok: false, message: "A lista de ids não corresponde aos depoimentos atuais." };
  }

  for (let i = 0; i < ids.length; i++) {
    await db`
      UPDATE bio_testimonials SET sort_order = ${i}, updated_at = NOW() WHERE id = ${ids[i]!}
    `;
  }
  return { ok: true };
}

/** Coleções de upload do bio (presign). */
export const BIO_UPLOAD_COLLECTIONS = ["bio-avatar", "bio-studio"] as const;
export type BioUploadCollection = (typeof BIO_UPLOAD_COLLECTIONS)[number];

export function isBioUploadCollection(value: unknown): value is BioUploadCollection {
  return (
    typeof value === "string" &&
    (BIO_UPLOAD_COLLECTIONS as readonly string[]).includes(value)
  );
}

export function buildBioObjectKey(collection: BioUploadCollection, ext: string): string {
  const folder = collection === "bio-avatar" ? "avatar" : "studio";
  return `bio/${folder}/${crypto.randomUUID()}.${ext}`;
}
