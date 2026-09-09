/** Tipos, validação e queries de bio_links. */

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { requireEnv, type Env } from "./config";

export const BIO_ICONS = [
  "whatsapp",
  "tiktok",
  "youtube",
  "instagram",
  "portfolio",
  "produtos",
  "link",
] as const;

export type BioIcon = (typeof BIO_ICONS)[number];

export type BioLink = {
  id: string;
  label: string;
  url: string;
  icon: BioIcon | null;
  featured: boolean;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

function sql(env: Env): NeonQueryFunction<false, false> {
  return neon(requireEnv(env, "DATABASE_URL"));
}

function mapLink(row: Record<string, unknown>): BioLink {
  const iconRaw = row.icon != null ? String(row.icon) : null;
  const icon =
    iconRaw && (BIO_ICONS as readonly string[]).includes(iconRaw)
      ? (iconRaw as BioIcon)
      : null;
  return {
    id: String(row.id),
    label: String(row.label),
    url: String(row.url),
    icon,
    featured: Boolean(row.featured),
    sort_order: Number(row.sort_order) || 0,
    published: Boolean(row.published),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function trimStr(value: unknown, max: number): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  return s.slice(0, max);
}

/** Aceita http(s) ou caminho relativo /… — rejeita javascript:, data:, etc. */
export function validateBioUrl(
  raw: unknown,
): { ok: true; url: string } | { ok: false; message: string } {
  const url = typeof raw === "string" ? raw.trim() : "";
  if (!url) return { ok: false, message: "Informe a URL." };
  if (url.length > 2000) return { ok: false, message: "URL longa demais." };

  if (url.startsWith("/") && !url.startsWith("//")) {
    if (url.includes(":") || url.toLowerCase().includes("javascript")) {
      return { ok: false, message: "Caminho relativo inválido." };
    }
    return { ok: true, url };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, message: "URL inválida." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, message: "Use apenas links http ou https." };
  }

  return { ok: true, url: parsed.toString() };
}

export function isBioIcon(value: unknown): value is BioIcon {
  return typeof value === "string" && (BIO_ICONS as readonly string[]).includes(value);
}

export type BioLinkCreateInput = {
  label: string;
  url: string;
  icon: BioIcon | null;
  featured: boolean;
  sort_order: number | null;
  published: boolean;
};

export type BioLinkPatchInput = Partial<{
  label: string;
  url: string;
  icon: BioIcon | null;
  featured: boolean;
  sort_order: number;
  published: boolean;
}>;

export function validateCreate(
  body: Record<string, unknown>,
): { ok: true; value: BioLinkCreateInput } | { ok: false; message: string } {
  const label = trimStr(body.label, 60);
  if (!label) return { ok: false, message: "Informe o rótulo." };

  const urlCheck = validateBioUrl(body.url);
  if (!urlCheck.ok) return urlCheck;

  let icon: BioIcon | null = null;
  if (body.icon != null && String(body.icon).trim()) {
    if (!isBioIcon(String(body.icon).trim())) {
      return { ok: false, message: "Ícone inválido." };
    }
    icon = String(body.icon).trim() as BioIcon;
  }

  const featured = Boolean(body.featured);
  const published = body.published === undefined ? true : Boolean(body.published);
  const sort_order =
    typeof body.sort_order === "number" && Number.isFinite(body.sort_order)
      ? Math.trunc(body.sort_order)
      : null;

  return {
    ok: true,
    value: { label, url: urlCheck.url, icon, featured, published, sort_order },
  };
}

export function validatePatch(
  body: Record<string, unknown>,
): { ok: true; value: BioLinkPatchInput } | { ok: false; message: string } {
  const patch: BioLinkPatchInput = {};

  if ("label" in body) {
    const label = trimStr(body.label, 60);
    if (!label) return { ok: false, message: "Informe o rótulo." };
    patch.label = label;
  }

  if ("url" in body) {
    const urlCheck = validateBioUrl(body.url);
    if (!urlCheck.ok) return urlCheck;
    patch.url = urlCheck.url;
  }

  if ("icon" in body) {
    if (body.icon == null || String(body.icon).trim() === "") {
      patch.icon = null;
    } else if (!isBioIcon(String(body.icon).trim())) {
      return { ok: false, message: "Ícone inválido." };
    } else {
      patch.icon = String(body.icon).trim() as BioIcon;
    }
  }

  if ("featured" in body) patch.featured = Boolean(body.featured);
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

export async function listPublished(env: Env): Promise<BioLink[]> {
  const db = sql(env);
  const rows = await db`
    SELECT id, label, url, icon, featured, sort_order, published, created_at, updated_at
    FROM bio_links
    WHERE published = TRUE
    ORDER BY sort_order ASC, created_at ASC
  `;
  return (rows as Record<string, unknown>[]).map(mapLink);
}

export async function listAll(env: Env): Promise<BioLink[]> {
  const db = sql(env);
  const rows = await db`
    SELECT id, label, url, icon, featured, sort_order, published, created_at, updated_at
    FROM bio_links
    ORDER BY sort_order ASC, created_at ASC
  `;
  return (rows as Record<string, unknown>[]).map(mapLink);
}

export async function findById(env: Env, id: string): Promise<BioLink | null> {
  const db = sql(env);
  const rows = await db`
    SELECT id, label, url, icon, featured, sort_order, published, created_at, updated_at
    FROM bio_links
    WHERE id = ${id}
    LIMIT 1
  `;
  if (!rows[0]) return null;
  return mapLink(rows[0] as Record<string, unknown>);
}

export async function createLink(env: Env, input: BioLinkCreateInput): Promise<BioLink> {
  const db = sql(env);
  let sortOrder = input.sort_order;
  if (sortOrder == null) {
    const maxRows = await db`SELECT COALESCE(MAX(sort_order), -1)::int AS max FROM bio_links`;
    sortOrder = Number((maxRows[0] as { max: number })?.max ?? -1) + 1;
  }

  const rows = await db`
    INSERT INTO bio_links (label, url, icon, featured, sort_order, published)
    VALUES (${input.label}, ${input.url}, ${input.icon}, ${input.featured}, ${sortOrder}, ${input.published})
    RETURNING id, label, url, icon, featured, sort_order, published, created_at, updated_at
  `;
  return mapLink(rows[0] as Record<string, unknown>);
}

export async function updateLink(
  env: Env,
  id: string,
  patch: BioLinkPatchInput,
): Promise<BioLink | null> {
  const current = await findById(env, id);
  if (!current) return null;

  const next = {
    label: patch.label ?? current.label,
    url: patch.url ?? current.url,
    icon: patch.icon !== undefined ? patch.icon : current.icon,
    featured: patch.featured ?? current.featured,
    sort_order: patch.sort_order ?? current.sort_order,
    published: patch.published ?? current.published,
  };

  const db = sql(env);
  const rows = await db`
    UPDATE bio_links SET
      label = ${next.label},
      url = ${next.url},
      icon = ${next.icon},
      featured = ${next.featured},
      sort_order = ${next.sort_order},
      published = ${next.published},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, label, url, icon, featured, sort_order, published, created_at, updated_at
  `;
  if (!rows[0]) return null;
  return mapLink(rows[0] as Record<string, unknown>);
}

export async function deleteLink(env: Env, id: string): Promise<BioLink | null> {
  const db = sql(env);
  const rows = await db`
    DELETE FROM bio_links
    WHERE id = ${id}
    RETURNING id, label, url, icon, featured, sort_order, published, created_at, updated_at
  `;
  if (!rows[0]) return null;
  return mapLink(rows[0] as Record<string, unknown>);
}

export async function reorderLinks(
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
  const existing = await db`SELECT id FROM bio_links`;
  const existingIds = new Set((existing as { id: string }[]).map((r) => String(r.id)));
  if (existingIds.size !== ids.length || ids.some((id) => !existingIds.has(id))) {
    return { ok: false, message: "A lista de ids não corresponde aos links atuais." };
  }

  for (let i = 0; i < ids.length; i++) {
    await db`
      UPDATE bio_links SET sort_order = ${i}, updated_at = NOW() WHERE id = ${ids[i]!}
    `;
  }
  return { ok: true };
}
