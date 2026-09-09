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
