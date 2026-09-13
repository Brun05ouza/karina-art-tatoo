/** Cliente público das galerias — uma tentativa, sem retry longo. */

export type PublicGalleryCollection = "portfolio" | "flash" | "produtos";

export type PublicGalleryItem = {
  id: string;
  collection: PublicGalleryCollection;
  title: string;
  category: string | null;
  price: string | null;
  link: string | null;
  status: string | null;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  published: boolean;
  featured?: boolean;
  focal_x?: number;
  focal_y?: number;
  created_at: string;
  updated_at: string;
};

export async function fetchGalleryItems(
  collection: PublicGalleryCollection,
): Promise<PublicGalleryItem[]> {
  try {
    const res = await fetch(`/api/gallery/${collection}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: PublicGalleryItem[] };
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [];
  }
}

/** Destaque (ou primeiro publicado). Null se a API falhar ou a coleção estiver vazia. */
export async function fetchGalleryFeatured(
  collection: PublicGalleryCollection,
): Promise<PublicGalleryItem | null> {
  try {
    const res = await fetch(`/api/gallery/${collection}/featured`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { item?: PublicGalleryItem | null };
    return data.item ?? null;
  } catch {
    return null;
  }
}
