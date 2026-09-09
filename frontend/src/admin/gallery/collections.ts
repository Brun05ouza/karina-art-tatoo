export type GalleryCollectionId = "portfolio" | "flash" | "produtos";

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
  },
  flash: {
    id: "flash",
    label: "Flash tattoos",
    singular: "flash",
    path: "/admin/galeria/flash",
    help: "Desenhos prontos. Marque como vendido quando não estiver mais disponível.",
    fields: ["title", "price", "status", "alt_text", "published"],
    required: ["title"],
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
  },
};

export const COLLECTION_LIST = Object.values(COLLECTIONS);
