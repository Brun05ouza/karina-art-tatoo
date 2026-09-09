/** Tipos, validação e queries de gallery_items. */

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { requireEnv, type Env } from "./config";

export const GALLERY_COLLECTIONS = ["portfolio", "flash", "produtos"] as const;
export type GalleryCollection = (typeof GALLERY_COLLECTIONS)[number];

export const FLASH_STATUSES = ["disponivel", "vendido"] as const;
export type FlashStatus = (typeof FLASH_STATUSES)[number];

export type GalleryItem = {
  id: string;
  collection: GalleryCollection;
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

export type PublicGalleryItem = Omit<GalleryItem, "image_key">;

export function isGalleryCollection(value: unknown): value is GalleryCollection {
  return typeof value === "string" && (GALLERY_COLLECTIONS as readonly string[]).includes(value);
}

function sql(env: Env): NeonQueryFunction<false, false> {
  return neon(requireEnv(env, "DATABASE_URL"));
}

function mapItem(row: Record<string, unknown>): GalleryItem {
  const collection = String(row.collection);
  if (!isGalleryCollection(collection)) {
    throw new Error(`Coleção inválida no banco: ${collection}`);
  }
  return {
    id: String(row.id),
    collection,
    title: String(row.title),
    category: row.category != null ? String(row.category) : null,
    price: row.price != null ? String(row.price) : null,
    link: row.link != null ? String(row.link) : null,
    status: row.status != null ? String(row.status) : null,
    image_url: String(row.image_url),
    image_key: String(row.image_key),
    alt_text: row.alt_text != null ? String(row.alt_text) : null,
    sort_order: Number(row.sort_order) || 0,
    published: Boolean(row.published),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function toPublicItem(item: GalleryItem): PublicGalleryItem {
  const { image_key: _, ...rest } = item;
  return rest;
}

function trimStr(value: unknown, max: number): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  return s.slice(0, max);
}

export type GalleryCreateInput = {
  title: string;
  category: string | null;
  price: string | null;
  link: string | null;
  status: string | null;
  image_url: string;
  image_key: string;
  alt_text: string | null;
  sort_order: number | null;
  published: boolean;
};

export type GalleryPatchInput = Partial<{
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
}>;

export function validateCreate(
  collection: GalleryCollection,
  body: Record<string, unknown>,
): { ok: true; value: GalleryCreateInput } | { ok: false; message: string } {
  const title = trimStr(body.title, 120);
  if (!title) return { ok: false, message: "Informe um título." };

  const image_url = trimStr(body.image_url, 2000);
  const image_key = trimStr(body.image_key, 500);
  if (!image_url || !image_key) {
    return { ok: false, message: "Imagem obrigatória (image_url e image_key)." };
  }

  const alt_text = trimStr(body.alt_text, 200);
  const published = body.published === undefined ? true : Boolean(body.published);
  const sort_order =
    typeof body.sort_order === "number" && Number.isFinite(body.sort_order)
      ? Math.trunc(body.sort_order)
      : null;

  let category: string | null = null;
  let price: string | null = null;
  let link: string | null = null;
  let status: string | null = null;

  if (collection === "portfolio") {
    if (body.link != null && String(body.link).trim()) {
      return { ok: false, message: "Portfólio não aceita link." };
    }
    if (body.status != null && String(body.status).trim()) {
      return { ok: false, message: "Portfólio não aceita status." };
    }
    if (body.price != null && String(body.price).trim()) {
      return { ok: false, message: "Portfólio não aceita preço." };
    }
    category = trimStr(body.category, 60);
  } else if (collection === "flash") {
    if (body.link != null && String(body.link).trim()) {
      return { ok: false, message: "Flash não aceita link." };
    }
    if (body.category != null && String(body.category).trim()) {
      return { ok: false, message: "Flash não aceita categoria." };
    }
    price = trimStr(body.price, 40);
    const st = trimStr(body.status, 20) || "disponivel";
    if (!(FLASH_STATUSES as readonly string[]).includes(st)) {
      return { ok: false, message: "Status do flash deve ser disponivel ou vendido." };
    }
    status = st;
  } else {
    if (body.status != null && String(body.status).trim()) {
      return { ok: false, message: "Produtos não aceitam status." };
    }
    if (body.category != null && String(body.category).trim()) {
      return { ok: false, message: "Produtos não aceitam categoria." };
    }
    price = trimStr(body.price, 40);
    link = trimStr(body.link, 2000);
  }

  return {
    ok: true,
    value: {
      title,
      category,
      price,
      link,
      status,
      image_url,
      image_key,
      alt_text,
      sort_order,
      published,
    },
  };
}

export function validatePatch(
  collection: GalleryCollection,
  body: Record<string, unknown>,
): { ok: true; value: GalleryPatchInput } | { ok: false; message: string } {
  const patch: GalleryPatchInput = {};

  if ("title" in body) {
    const title = trimStr(body.title, 120);
    if (!title) return { ok: false, message: "Título não pode ficar vazio." };
    patch.title = title;
  }
  if ("alt_text" in body) patch.alt_text = trimStr(body.alt_text, 200);
  if ("published" in body) patch.published = Boolean(body.published);
  if ("sort_order" in body) {
    if (typeof body.sort_order !== "number" || !Number.isFinite(body.sort_order)) {
      return { ok: false, message: "sort_order inválido." };
    }
    patch.sort_order = Math.trunc(body.sort_order);
  }
  if ("image_url" in body || "image_key" in body) {
    const image_url = trimStr(body.image_url, 2000);
    const image_key = trimStr(body.image_key, 500);
    if (!image_url || !image_key) {
      return { ok: false, message: "Ao trocar a imagem, envie image_url e image_key." };
    }
    patch.image_url = image_url;
    patch.image_key = image_key;
  }

  const reject = (field: string, label: string) => ({
    ok: false as const,
    message: `${label} não aceita o campo ${field}.`,
  });

  if (collection === "portfolio") {
    if ("link" in body && body.link != null && String(body.link).trim()) return reject("link", "Portfólio");
    if ("status" in body && body.status != null && String(body.status).trim()) return reject("status", "Portfólio");
    if ("price" in body && body.price != null && String(body.price).trim()) return reject("price", "Portfólio");
    if ("category" in body) patch.category = trimStr(body.category, 60);
  } else if (collection === "flash") {
    if ("link" in body && body.link != null && String(body.link).trim()) return reject("link", "Flash");
    if ("category" in body && body.category != null && String(body.category).trim()) {
      return reject("category", "Flash");
    }
    if ("price" in body) patch.price = trimStr(body.price, 40);
    if ("status" in body) {
      const st = trimStr(body.status, 20);
      if (!st || !(FLASH_STATUSES as readonly string[]).includes(st)) {
        return { ok: false, message: "Status do flash deve ser disponivel ou vendido." };
      }
      patch.status = st;
    }
  } else {
    if ("status" in body && body.status != null && String(body.status).trim()) return reject("status", "Produtos");
    if ("category" in body && body.category != null && String(body.category).trim()) {
      return reject("category", "Produtos");
    }
    if ("price" in body) patch.price = trimStr(body.price, 40);
    if ("link" in body) patch.link = trimStr(body.link, 2000);
  }

  if (Object.keys(patch).length === 0) {
    return { ok: false, message: "Nenhum campo para atualizar." };
  }
  return { ok: true, value: patch };
}

export async function listPublished(
  env: Env,
  collection: GalleryCollection,
): Promise<GalleryItem[]> {
  const db = sql(env);
  const rows = await db`
    SELECT id, collection, title, category, price, link, status,
           image_url, image_key, alt_text, sort_order, published,
           created_at, updated_at
    FROM gallery_items
    WHERE collection = ${collection} AND published = TRUE
    ORDER BY sort_order ASC, created_at ASC
  `;
  return (rows as Record<string, unknown>[]).map(mapItem);
}

export async function listAll(env: Env, collection: GalleryCollection): Promise<GalleryItem[]> {
  const db = sql(env);
  const rows = await db`
    SELECT id, collection, title, category, price, link, status,
           image_url, image_key, alt_text, sort_order, published,
           created_at, updated_at
    FROM gallery_items
    WHERE collection = ${collection}
    ORDER BY sort_order ASC, created_at ASC
  `;
  return (rows as Record<string, unknown>[]).map(mapItem);
}

export async function findItemById(env: Env, id: string): Promise<GalleryItem | null> {
  const db = sql(env);
  const rows = await db`
    SELECT id, collection, title, category, price, link, status,
           image_url, image_key, alt_text, sort_order, published,
           created_at, updated_at
    FROM gallery_items
    WHERE id = ${id}
    LIMIT 1
  `;
  if (!rows[0]) return null;
  return mapItem(rows[0] as Record<string, unknown>);
}

export async function createItem(
  env: Env,
  collection: GalleryCollection,
  input: GalleryCreateInput,
): Promise<GalleryItem> {
  const db = sql(env);
  let sortOrder = input.sort_order;
  if (sortOrder == null) {
    const maxRows = await db`
      SELECT COALESCE(MAX(sort_order), -1)::int AS max
      FROM gallery_items
      WHERE collection = ${collection}
    `;
    sortOrder = Number((maxRows[0] as { max: number })?.max ?? -1) + 1;
  }

  const rows = await db`
    INSERT INTO gallery_items (
      collection, title, category, price, link, status,
      image_url, image_key, alt_text, sort_order, published
    ) VALUES (
      ${collection},
      ${input.title},
      ${input.category},
      ${input.price},
      ${input.link},
      ${input.status},
      ${input.image_url},
      ${input.image_key},
      ${input.alt_text},
      ${sortOrder},
      ${input.published}
    )
    RETURNING id, collection, title, category, price, link, status,
              image_url, image_key, alt_text, sort_order, published,
              created_at, updated_at
  `;
  return mapItem(rows[0] as Record<string, unknown>);
}

export async function updateItem(
  env: Env,
  id: string,
  patch: GalleryPatchInput,
): Promise<GalleryItem | null> {
  const current = await findItemById(env, id);
  if (!current) return null;

  const next = {
    title: patch.title ?? current.title,
    category: patch.category !== undefined ? patch.category : current.category,
    price: patch.price !== undefined ? patch.price : current.price,
    link: patch.link !== undefined ? patch.link : current.link,
    status: patch.status !== undefined ? patch.status : current.status,
    image_url: patch.image_url ?? current.image_url,
    image_key: patch.image_key ?? current.image_key,
    alt_text: patch.alt_text !== undefined ? patch.alt_text : current.alt_text,
    sort_order: patch.sort_order ?? current.sort_order,
    published: patch.published ?? current.published,
  };

  const db = sql(env);
  const rows = await db`
    UPDATE gallery_items SET
      title = ${next.title},
      category = ${next.category},
      price = ${next.price},
      link = ${next.link},
      status = ${next.status},
      image_url = ${next.image_url},
      image_key = ${next.image_key},
      alt_text = ${next.alt_text},
      sort_order = ${next.sort_order},
      published = ${next.published},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, collection, title, category, price, link, status,
              image_url, image_key, alt_text, sort_order, published,
              created_at, updated_at
  `;
  if (!rows[0]) return null;
  return mapItem(rows[0] as Record<string, unknown>);
}

export async function deleteItem(env: Env, id: string): Promise<GalleryItem | null> {
  const db = sql(env);
  const rows = await db`
    DELETE FROM gallery_items
    WHERE id = ${id}
    RETURNING id, collection, title, category, price, link, status,
              image_url, image_key, alt_text, sort_order, published,
              created_at, updated_at
  `;
  if (!rows[0]) return null;
  return mapItem(rows[0] as Record<string, unknown>);
}

export async function reorderItems(
  env: Env,
  collection: GalleryCollection,
  ids: string[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { ok: false, message: "Envie a lista de ids na nova ordem." };
  }
  if (ids.some((id) => typeof id !== "string" || !id)) {
    return { ok: false, message: "Lista de ids inválida." };
  }

  const db = sql(env);
  const existing = await db`
    SELECT id FROM gallery_items WHERE collection = ${collection}
  `;
  const existingIds = new Set((existing as { id: string }[]).map((r) => String(r.id)));

  if (ids.length !== existingIds.size) {
    return { ok: false, message: "A lista deve incluir todos os itens da coleção." };
  }
  for (const id of ids) {
    if (!existingIds.has(id)) {
      return { ok: false, message: "Há um id que não pertence a esta coleção." };
    }
  }

  for (let i = 0; i < ids.length; i++) {
    await db`
      UPDATE gallery_items
      SET sort_order = ${i}, updated_at = NOW()
      WHERE id = ${ids[i]!} AND collection = ${collection}
    `;
  }
  return { ok: true };
}

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export function extensionForMime(mime: string): string | null {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    default:
      return null;
  }
}

export function buildObjectKey(collection: GalleryCollection, ext: string): string {
  const now = new Date();
  const ym = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return `${collection}/${ym}/${crypto.randomUUID()}.${ext}`;
}
