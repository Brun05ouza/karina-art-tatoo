import { useEffect, useState } from "react";
import { DEFAULT_FOCAL, normalizeFocal, type FocalPoint } from "./focal";
import { fetchGalleryItems } from "./gallery-api";

export type ProductsPageContent = {
  heroKicker: string;
  heroTitle: string;
  heroText1: string;
  heroText2: string;
  heroButton: string;
  /** URL da arte (só o desenho) — a moldura é asset de design fixo. */
  heroImageUrl: string;
  heroFocal: FocalPoint;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  hiddenSections?: string[];
};

export type ProductCatalogItem = {
  id: string;
  order: number;
  active: boolean;
  title: string;
  description?: string;
  category: string;
  status: string;
  price?: string;
  whatsappMessage?: string;
  link?: string;
  imageUrl?: string;
  focalX?: number;
  focalY?: number;
};

export const defaultProductsPageContent: ProductsPageContent = {
  heroKicker: "Coleções",
  heroTitle: "Coleções da Karina Sarte",
  heroText1: "Arte para usar, colecionar e levar na pele.",
  heroText2:
    "Produtos autorais, planos, flashes, prints e criações exclusivas feitas para aproximar ainda mais a arte da Karina Sarte de quem acompanha seu trabalho.",
  heroButton: "Consultar produtos pelo WhatsApp",
  heroImageUrl: "",
  heroFocal: { ...DEFAULT_FOCAL },
  ctaTitle: "Quer levar a arte da Karina Sarte para além da pele?",
  ctaText: "Consulte disponibilidade, valores e opções personalizadas pelo WhatsApp.",
  ctaButton: "Consultar pelo WhatsApp",
};

/** Fallback vazio — catálogo vem da API. */
export const defaultProductItems: ProductCatalogItem[] = [];

/** Moldura fixa do hero de produtos (design, versionada em public/assets). */
export const PRODUCTS_HERO_MOLD_SRC = "/assets/molde-produto.webp";

function mapProducts(items: Awaited<ReturnType<typeof fetchGalleryItems>>): ProductCatalogItem[] {
  return items
    .filter((item) => Boolean(item.image_url))
    .map((item, index) => ({
      id: item.id,
      order: item.sort_order ?? index,
      active: true,
      title: item.title,
      category: "Produtos",
      status: "Publicado",
      price: item.price ?? undefined,
      whatsappMessage: `Olá! Quero saber sobre: ${item.title}`,
      link: item.link ?? "",
      imageUrl: item.image_url,
      focalX: item.focal_x ?? 50,
      focalY: item.focal_y ?? 50,
    }));
}

export function useProductsPageContent(): ProductsPageContent {
  const [data, setData] = useState<ProductsPageContent>(defaultProductsPageContent);

  useEffect(() => {
    let active = true;
    void fetch("/api/settings", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return defaultProductsPageContent;
        const json = (await res.json()) as {
          productsHeroImageUrl?: string;
          productsHeroFocalX?: number;
          productsHeroFocalY?: number;
        };
        return {
          ...defaultProductsPageContent,
          heroImageUrl: json.productsHeroImageUrl?.trim() ?? "",
          heroFocal: normalizeFocal(json.productsHeroFocalX, json.productsHeroFocalY),
        };
      })
      .then((next) => {
        if (active) setData(next);
      })
      .catch(() => {
        if (active) setData(defaultProductsPageContent);
      });
    return () => {
      active = false;
    };
  }, []);

  return data;
}

export function useProductItems(): ProductCatalogItem[] {
  const [items, setItems] = useState<ProductCatalogItem[]>(defaultProductItems);

  useEffect(() => {
    let active = true;
    void fetchGalleryItems("produtos").then((raw) => {
      if (active) setItems(mapProducts(raw));
    });
    return () => {
      active = false;
    };
  }, []);

  return [...items]
    .filter((item) => item.active && item.status !== "Oculto")
    .sort((a, b) => a.order - b.order);
}
