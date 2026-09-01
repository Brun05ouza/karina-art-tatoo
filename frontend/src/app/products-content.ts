import { useEffect, useState } from "react";
import { API_URL } from "../lib/api-base";

export type ProductsPageContent = {
  heroKicker: string;
  heroTitle: string;
  heroText1: string;
  heroText2: string;
  heroButton: string;
  heroImageUrl: string;
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
};

export const defaultProductsPageContent: ProductsPageContent = {
  heroKicker: "Coleções",
  heroTitle: "Coleções da Karina Sarte",
  heroText1: "Arte para usar, colecionar e levar na pele.",
  heroText2: "Produtos autorais, planos, flashes, prints e criações exclusivas feitas para aproximar ainda mais a arte da Karina Sarte de quem acompanha seu trabalho.",
  heroButton: "Consultar produtos pelo WhatsApp",
  heroImageUrl: "",
  ctaTitle: "Quer levar a arte da Karina Sarte para além da pele?",
  ctaText: "Consulte disponibilidade, valores e opções personalizadas pelo WhatsApp.",
  ctaButton: "Consultar pelo WhatsApp",
};

export const defaultProductItems: ProductCatalogItem[] = [
  { id: "product-1", order: 1, active: true, title: "Adesivos autorais", description: "Seleção de adesivos da Karina Sarte.", category: "Adesivos", status: "Publicado", price: "R$ 25", whatsappMessage: "Olá! Quero saber sobre os adesivos autorais.", link: "", imageUrl: "" },
  { id: "product-2", order: 2, active: true, title: "Print botânico", description: "Impressão artística em papel de alta gramatura.", category: "Prints & Artes", status: "Publicado", price: "R$ 65", whatsappMessage: "Olá! Quero saber sobre o print botânico.", link: "", imageUrl: "" },
  { id: "product-3", order: 3, active: true, title: "Plano tattoo pequena", description: "Opção para projetos delicados e objetivos.", category: "Planos de Tattoo", status: "Publicado", price: "Sob consulta", whatsappMessage: "Olá! Quero conhecer o plano de tattoo pequena.", link: "", imageUrl: "" },
];

export function useProductsPageContent(): ProductsPageContent {
  const [data, setData] = useState<ProductsPageContent>(defaultProductsPageContent);

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/api/content/products-page`)
      .then((response) => (response.ok ? response.json() : null))
      .then((entry: { value?: Partial<ProductsPageContent> } | null) => {
        if (active && entry?.value) setData({ ...defaultProductsPageContent, ...entry.value });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return data;
}

export function useProductItems(): ProductCatalogItem[] {
  const [items, setItems] = useState<ProductCatalogItem[]>([]);

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/api/content/produtos`)
      .then((response) => (response.ok ? response.json() : null))
      .then((entry: { value?: ProductCatalogItem[] } | null) => {
        if (active) setItems(Array.isArray(entry?.value) ? entry.value : []);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return [...items]
    .filter((item) => item.active && item.status !== "Oculto")
    .sort((a, b) => a.order - b.order);
}
