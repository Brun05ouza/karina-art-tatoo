export type GalleryCollectionId = "portfolio" | "flash" | "produtos" | "reformulacoes";

export type CollectionField =
  | "title"
  | "category"
  | "price"
  | "link"
  | "status"
  | "alt_text"
  | "published";

export type CollectionConfig = {
  id: GalleryCollectionId;
  label: string;
  singular: string;
  path: string;
  help: string;
  fields: CollectionField[];
  required: CollectionField[];
  /** Uma foto (padrão) ou par antes/depois. */
  imageMode?: "single" | "before-after";
  statusOptions?: Array<{ value: string; label: string }>;
};

export const COLLECTIONS: Record<GalleryCollectionId, CollectionConfig> = {
  portfolio: {
    id: "portfolio",
    label: "Portfólio",
    singular: "trabalho",
    path: "/admin/galeria/portfolio",
    help: "Fotos dos trabalhos tatuados. Título e categoria ajudam a organizar.",
    fields: ["title", "category", "alt_text", "published"],
    required: ["title"],
    imageMode: "single",
  },
  flash: {
    id: "flash",
    label: "Flash tattoos",
    singular: "flash",
    path: "/admin/galeria/flash",
    help: "Desenhos prontos. Marque como vendido quando não estiver mais disponível.",
    fields: ["title", "price", "status", "alt_text", "published"],
    required: ["title"],
    imageMode: "single",
    statusOptions: [
      { value: "disponivel", label: "Disponível" },
      { value: "vendido", label: "Vendido" },
    ],
  },
  produtos: {
    id: "produtos",
    label: "Produtos",
    singular: "produto",
    path: "/admin/galeria/produtos",
    help: "Adesivos, prints e planos. O preço pode ser texto, tipo “a partir de R$ 300”.",
    fields: ["title", "price", "link", "alt_text", "published"],
    required: ["title"],
    imageMode: "single",
  },
  reformulacoes: {
    id: "reformulacoes",
    label: "Reformulações",
    singular: "caso",
    path: "/admin/galeria/reformulacoes",
    help: "Antes e depois. Dá para salvar só o antes e completar o depois depois da cicatrização.",
    fields: ["title", "category", "published"],
    required: ["title"],
    imageMode: "before-after",
  },
};

export const COLLECTION_LIST = Object.values(COLLECTIONS);

export function isIncompleteReformulation(item: {
  after_image_url?: string | null;
  after_image_key?: string | null;
}): boolean {
  return !(item.after_image_url?.trim() && item.after_image_key?.trim());
}
