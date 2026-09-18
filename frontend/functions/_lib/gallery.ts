/** Tipos, validação e queries de gallery_items. */

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { requireEnv, type Env } from "./config";

export const GALLERY_COLLECTIONS = ["portfolio", "flash", "produtos", "reformulacoes"] as const;
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

export type PublicGalleryItem = Omit<GalleryItem, "image_key" | "after_image_key">;

export function isGalleryCollection(value: unknown): value is GalleryCollection {
  return typeof value === "string" && (GALLERY_COLLECTIONS as readonly string[]).includes(value);
}

/** Caso de reformulação com foto do depois. */
export function hasAfterImage(item: Pick<GalleryItem, "after_image_url" | "after_image_key">): boolean {
  return Boolean(item.after_image_url?.trim() && item.after_image_key?.trim());
}

export function isReformulationIncomplete(item: GalleryItem): boolean {
  return item.collection === "reformulacoes" && !hasAfterImage(item);
}

function sql(env: Env): NeonQueryFunction<false, false> {
  return neon(requireEnv(env, "DATABASE_URL"));
}

function clampFocal(value: unknown, fallback = 50): number | null {
  if (value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return Number.NaN;
  const rounded = Math.round(n);
  if (rounded < 0 || rounded > 100) return Number.NaN;
  return rounded;
}

function readNamedFocal(
  body: Record<string, unknown>,
  camelX: string,
  camelY: string,
  snakeX: string,
  snakeY: string,
): { ok: true; x?: number; y?: number } | { ok: false; message: string } {
  const hasX = camelX in body || snakeX in body;
  const hasY = camelY in body || snakeY in body;
  if (!hasX && !hasY) return { ok: true };

  const xRaw = hasX ? (camelX in body ? body[camelX] : body[snakeX]) : undefined;
  const yRaw = hasY ? (camelY in body ? body[camelY] : body[snakeY]) : undefined;

  let x: number | undefined;
  let y: number | undefined;

  if (hasX) {
    const parsed = clampFocal(xRaw);
    if (parsed === null || Number.isNaN(parsed)) {
      return { ok: false, message: `${camelX} deve ser um inteiro entre 0 e 100.` };
    }
    x = parsed;
  }
  if (hasY) {
    const parsed = clampFocal(yRaw);
    if (parsed === null || Number.isNaN(parsed)) {
      return { ok: false, message: `${camelY} deve ser um inteiro entre 0 e 100.` };
    }
    y = parsed;
  }
  return { ok: true, x, y };
}

/** Lê focalX/focalY ou focal_x/focal_y do body. */
function readFocalPair(
  body: Record<string, unknown>,
): { ok: true; x?: number; y?: number } | { ok: false; message: string } {
  return readNamedFocal(body, "focalX", "focalY", "focal_x", "focal_y");
}

function readAfterFocalPair(
  body: Record<string, unknown>,
): { ok: true; x?: number; y?: number } | { ok: false; message: string } {
  return readNamedFocal(body, "afterFocalX", "afterFocalY", "after_focal_x", "after_focal_y");
}

function mapFocal(row: Record<string, unknown>, key: string): number {
  const n = Number(row[key]);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 50;
}

function mapItem(row: Record<string, unknown>): GalleryItem {
  const collection = String(row.collection);
  if (!isGalleryCollection(collection)) {
    throw new Error(`Coleção inválida no banco: ${collection}`);
  }
  const afterUrl =
    row.after_image_url != null && String(row.after_image_url).trim()
      ? String(row.after_image_url)
      : null;
  const afterKey =
    row.after_image_key != null && String(row.after_image_key).trim()
      ? String(row.after_image_key)
      : null;
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
    featured: Boolean(row.featured),
    show_in_recent: row.show_in_recent === undefined ? true : Boolean(row.show_in_recent),
    focal_x: mapFocal(row, "focal_x"),
    focal_y: mapFocal(row, "focal_y"),
    after_image_url: afterUrl,
    after_image_key: afterKey,
    after_focal_x: mapFocal(row, "after_focal_x"),
    after_focal_y: mapFocal(row, "after_focal_y"),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function toPublicItem(item: GalleryItem): PublicGalleryItem {
  const { image_key: _k, after_image_key: _ak, ...rest } = item;
  return rest;
}

function trimStr(value: unknown, max: number): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  return s.slice(0, max);
}

function parseAfterImage(
  body: Record<string, unknown>,
  required: boolean,
):
  | { ok: true; url: string | null; key: string | null }
  | { ok: false; message: string } {
  const hasUrl = "after_image_url" in body || "afterImageUrl" in body;
  const hasKey = "after_image_key" in body || "afterImageKey" in body;
  if (!hasUrl && !hasKey) {
    if (required) return { ok: false, message: "Imagem do depois obrigatória (after_image_url e after_image_key)." };
    return { ok: true, url: null, key: null };
  }

  const url = trimStr(
    "after_image_url" in body ? body.after_image_url : body.afterImageUrl,
    2000,
  );
  const key = trimStr(
    "after_image_key" in body ? body.after_image_key : body.afterImageKey,
    500,
  );

  if (!url && !key) {
    // Limpar o depois (voltar a rascunho)
    return { ok: true, url: null, key: null };
  }
  if (!url || !key) {
    return { ok: false, message: "Ao enviar a foto do depois, informe after_image_url e after_image_key." };
  }
  return { ok: true, url, key };
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
  show_in_recent: boolean;
  focal_x: number;
  focal_y: number;
  after_image_url: string | null;
  after_image_key: string | null;
  after_focal_x: number;
  after_focal_y: number;
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
  featured: boolean;
  show_in_recent: boolean;
  focal_x: number;
  focal_y: number;
  after_image_url: string | null;
  after_image_key: string | null;
  after_focal_x: number;
  after_focal_y: number;
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
    return {
      ok: false,
      message:
        collection === "reformulacoes"
          ? "Imagem do antes obrigatória (image_url e image_key)."
          : "Imagem obrigatória (image_url e image_key).",
    };
  }

  const alt_text = trimStr(body.alt_text, 200);
  let published = body.published === undefined ? true : Boolean(body.published);
  const show_in_recent =
    "show_in_recent" in body || "showInRecent" in body
      ? Boolean("show_in_recent" in body ? body.show_in_recent : body.showInRecent)
      : true;
  const sort_order =
    typeof body.sort_order === "number" && Number.isFinite(body.sort_order)
      ? Math.trunc(body.sort_order)
      : null;

  const focal = readFocalPair(body);
  if (!focal.ok) return focal;

  const afterFocal = readAfterFocalPair(body);
  if (!afterFocal.ok) return afterFocal;

  let category: string | null = null;
  let price: string | null = null;
  let link: string | null = null;
  let status: string | null = null;
  let after_image_url: string | null = null;
  let after_image_key: string | null = null;

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
  } else if (collection === "produtos") {
    if (body.status != null && String(body.status).trim()) {
      return { ok: false, message: "Produtos não aceitam status." };
    }
    if (body.category != null && String(body.category).trim()) {
      return { ok: false, message: "Produtos não aceitam categoria." };
    }
    price = trimStr(body.price, 40);
    link = trimStr(body.link, 2000);
  } else {
    // reformulacoes
    if (body.link != null && String(body.link).trim()) {
      return { ok: false, message: "Reformulações não aceitam link." };
    }
    if (body.status != null && String(body.status).trim()) {
      return { ok: false, message: "Reformulações não aceitam status." };
    }
    if (body.price != null && String(body.price).trim()) {
      return { ok: false, message: "Reformulações não aceitam preço." };
    }
    category = trimStr(body.category, 60);

    const after = parseAfterImage(body, false);
    if (!after.ok) return after;
    after_image_url = after.url;
    after_image_key = after.key;

    if (published && (!after_image_url || !after_image_key)) {
      published = false;
    }
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
      show_in_recent,
      focal_x: focal.x ?? 50,
      focal_y: focal.y ?? 50,
      after_image_url,
      after_image_key,
      after_focal_x: afterFocal.x ?? 50,
      after_focal_y: afterFocal.y ?? 50,
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
  if ("featured" in body) patch.featured = Boolean(body.featured);
  if ("show_in_recent" in body || "showInRecent" in body) {
    patch.show_in_recent = Boolean(
      "show_in_recent" in body ? body.show_in_recent : body.showInRecent,
    );
  }
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
    patch.focal_x = 50;
    patch.focal_y = 50;
  }

  const focal = readFocalPair(body);
  if (!focal.ok) return focal;
  if (focal.x !== undefined) patch.focal_x = focal.x;
  if (focal.y !== undefined) patch.focal_y = focal.y;

  if (collection === "reformulacoes") {
    const hasAfterUrl = "after_image_url" in body || "afterImageUrl" in body;
    const hasAfterKey = "after_image_key" in body || "afterImageKey" in body;
    if (hasAfterUrl || hasAfterKey) {
      const after = parseAfterImage(body, false);
      if (!after.ok) return after;
      patch.after_image_url = after.url;
      patch.after_image_key = after.key;
      if (after.url && after.key) {
        patch.after_focal_x = 50;
        patch.after_focal_y = 50;
      }
    }
    const afterFocal = readAfterFocalPair(body);
    if (!afterFocal.ok) return afterFocal;
    if (afterFocal.x !== undefined) patch.after_focal_x = afterFocal.x;
    if (afterFocal.y !== undefined) patch.after_focal_y = afterFocal.y;
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
  } else if (collection === "produtos") {
    if ("status" in body && body.status != null && String(body.status).trim()) return reject("status", "Produtos");
    if ("category" in body && body.category != null && String(body.category).trim()) {
      return reject("category", "Produtos");
    }
    if ("price" in body) patch.price = trimStr(body.price, 40);
    if ("link" in body) patch.link = trimStr(body.link, 2000);
  } else {
    if ("link" in body && body.link != null && String(body.link).trim()) {
      return reject("link", "Reformulações");
    }
    if ("status" in body && body.status != null && String(body.status).trim()) {
      return reject("status", "Reformulações");
    }
    if ("price" in body && body.price != null && String(body.price).trim()) {
      return reject("price", "Reformulações");
    }
    if ("category" in body) patch.category = trimStr(body.category, 60);
  }

  if (Object.keys(patch).length === 0) {
    return { ok: false, message: "Nenhum campo para atualizar." };
  }
  return { ok: true, value: patch };
}

/** Bloqueia publicar reformulação sem as duas fotos (create já força published=false). */
export function assertPublishAllowed(
  collection: GalleryCollection,
  current: GalleryItem,
  patch: GalleryPatchInput,
): { ok: true } | { ok: false; message: string } {
  if (collection !== "reformulacoes") return { ok: true };

  const nextPublished = patch.published ?? current.published;
  if (!nextPublished) return { ok: true };

  const afterUrl =
    patch.after_image_url !== undefined ? patch.after_image_url : current.after_image_url;
  const afterKey =
    patch.after_image_key !== undefined ? patch.after_image_key : current.after_image_key;

  if (!afterUrl?.trim() || !afterKey?.trim()) {
    return {
      ok: false,
      message: "Para publicar, envie as fotos de antes e depois.",
    };
  }
  return { ok: true };
}

export async function listPublished(
  env: Env,
  collection: GalleryCollection,
): Promise<GalleryItem[]> {
  const db = sql(env);
  const rows =
    collection === "reformulacoes"
      ? await db`
          SELECT id, collection, title, category, price, link, status,
                 image_url, image_key, alt_text, sort_order, published, featured, show_in_recent,
                 focal_x, focal_y,
                 after_image_url, after_image_key, after_focal_x, after_focal_y,
                 created_at, updated_at
          FROM gallery_items
          WHERE collection = ${collection}
            AND published = TRUE
            AND after_image_url IS NOT NULL AND TRIM(after_image_url) <> ''
            AND after_image_key IS NOT NULL AND TRIM(after_image_key) <> ''
          ORDER BY sort_order ASC, created_at ASC
        `
      : await db`
          SELECT id, collection, title, category, price, link, status,
                 image_url, image_key, alt_text, sort_order, published, featured, show_in_recent,
                 focal_x, focal_y,
                 after_image_url, after_image_key, after_focal_x, after_focal_y,
                 created_at, updated_at
          FROM gallery_items
          WHERE collection = ${collection} AND published = TRUE
          ORDER BY sort_order ASC, created_at ASC
        `;
  return (rows as Record<string, unknown>[]).map(mapItem);
}

export async function getFeaturedOrFirst(
  env: Env,
  collection: GalleryCollection,
): Promise<GalleryItem | null> {
  const db = sql(env);
  const featured = await db`
    SELECT id, collection, title, category, price, link, status,
           image_url, image_key, alt_text, sort_order, published, featured, show_in_recent,
           focal_x, focal_y,
           after_image_url, after_image_key, after_focal_x, after_focal_y,
           created_at, updated_at
    FROM gallery_items
    WHERE collection = ${collection} AND published = TRUE AND featured = TRUE
    LIMIT 1
  `;
  if (featured[0]) return mapItem(featured[0] as Record<string, unknown>);

  const first = await db`
    SELECT id, collection, title, category, price, link, status,
           image_url, image_key, alt_text, sort_order, published, featured, show_in_recent,
           focal_x, focal_y,
           after_image_url, after_image_key, after_focal_x, after_focal_y,
           created_at, updated_at
    FROM gallery_items
    WHERE collection = ${collection} AND published = TRUE
    ORDER BY sort_order ASC, created_at ASC
    LIMIT 1
  `;
  if (!first[0]) return null;
  return mapItem(first[0] as Record<string, unknown>);
}

export async function listAll(env: Env, collection: GalleryCollection): Promise<GalleryItem[]> {
  const db = sql(env);
  const rows = await db`
    SELECT id, collection, title, category, price, link, status,
           image_url, image_key, alt_text, sort_order, published, featured, show_in_recent,
           focal_x, focal_y,
           after_image_url, after_image_key, after_focal_x, after_focal_y,
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
           image_url, image_key, alt_text, sort_order, published, featured, show_in_recent,
           focal_x, focal_y,
           after_image_url, after_image_key, after_focal_x, after_focal_y,
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
      image_url, image_key, alt_text, sort_order, published, show_in_recent,
      focal_x, focal_y,
      after_image_url, after_image_key, after_focal_x, after_focal_y
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
      ${input.published},
      ${input.show_in_recent},
      ${input.focal_x},
      ${input.focal_y},
      ${input.after_image_url},
      ${input.after_image_key},
      ${input.after_focal_x},
      ${input.after_focal_y}
    )
    RETURNING id, collection, title, category, price, link, status,
              image_url, image_key, alt_text, sort_order, published, featured, show_in_recent,
              focal_x, focal_y,
              after_image_url, after_image_key, after_focal_x, after_focal_y,
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

  const published = patch.published ?? current.published;
  const featured = published === false ? false : current.featured;
  const show_in_recent =
    patch.show_in_recent !== undefined ? patch.show_in_recent : current.show_in_recent;
  const imageChanged = Boolean(patch.image_url && patch.image_key);
  const afterChanged =
    patch.after_image_url !== undefined || patch.after_image_key !== undefined;
  const afterReplaced = Boolean(
    afterChanged && patch.after_image_url && patch.after_image_key,
  );

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
    published,
    featured,
    show_in_recent,
    focal_x: imageChanged && patch.focal_x === undefined ? 50 : (patch.focal_x ?? current.focal_x),
    focal_y: imageChanged && patch.focal_y === undefined ? 50 : (patch.focal_y ?? current.focal_y),
    after_image_url:
      patch.after_image_url !== undefined ? patch.after_image_url : current.after_image_url,
    after_image_key:
      patch.after_image_key !== undefined ? patch.after_image_key : current.after_image_key,
    after_focal_x:
      afterReplaced && patch.after_focal_x === undefined
        ? 50
        : (patch.after_focal_x ?? current.after_focal_x),
    after_focal_y:
      afterReplaced && patch.after_focal_y === undefined
        ? 50
        : (patch.after_focal_y ?? current.after_focal_y),
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
      featured = ${next.featured},
      show_in_recent = ${next.show_in_recent},
      focal_x = ${next.focal_x},
      focal_y = ${next.focal_y},
      after_image_url = ${next.after_image_url},
      after_image_key = ${next.after_image_key},
      after_focal_x = ${next.after_focal_x},
      after_focal_y = ${next.after_focal_y},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, collection, title, category, price, link, status,
              image_url, image_key, alt_text, sort_order, published, featured, show_in_recent,
              focal_x, focal_y,
              after_image_url, after_image_key, after_focal_x, after_focal_y,
              created_at, updated_at
  `;
  if (!rows[0]) return null;
  return mapItem(rows[0] as Record<string, unknown>);
}

export async function setItemFeatured(
  env: Env,
  id: string,
  featured: boolean,
): Promise<GalleryItem | null> {
  const current = await findItemById(env, id);
  if (!current) return null;

  if (featured && !current.published) {
    throw new Error("HIDDEN_FEATURED");
  }

  const db = sql(env);

  if (!featured) {
    const rows = await db`
      UPDATE gallery_items
      SET featured = FALSE, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, collection, title, category, price, link, status,
                image_url, image_key, alt_text, sort_order, published, featured, show_in_recent,
                focal_x, focal_y,
                after_image_url, after_image_key, after_focal_x, after_focal_y,
                created_at, updated_at
    `;
    if (!rows[0]) return null;
    return mapItem(rows[0] as Record<string, unknown>);
  }

  await db.transaction((txn) => [
    txn`
      UPDATE gallery_items
      SET featured = FALSE, updated_at = NOW()
      WHERE collection = ${current.collection} AND featured = TRUE AND id <> ${id}
    `,
    txn`
      UPDATE gallery_items
      SET featured = TRUE, updated_at = NOW()
      WHERE id = ${id}
    `,
  ]);

  return findItemById(env, id);
}

export async function deleteItem(env: Env, id: string): Promise<GalleryItem | null> {
  const db = sql(env);
  const rows = await db`
    DELETE FROM gallery_items
    WHERE id = ${id}
    RETURNING id, collection, title, category, price, link, status,
              image_url, image_key, alt_text, sort_order, published, featured, show_in_recent,
              focal_x, focal_y,
              after_image_url, after_image_key, after_focal_x, after_focal_y,
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
