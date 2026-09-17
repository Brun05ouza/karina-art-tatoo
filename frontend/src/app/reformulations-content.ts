import { useEffect, useState } from "react";
import type { PublicGalleryItem } from "./gallery-api";

export type ReformulationPoint = { id: string; label: string; active: boolean; order: number };
export type ReformulationCard = { id: string; title: string; text: string; active: boolean; order: number };

export type ReformulationCase = {
  id: string;
  order: number;
  active: boolean;
  title: string;
  description?: string;
  category: string;
  status: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  beforeVideoUrl?: string;
  afterVideoUrl?: string;
  beforeFocalX?: number;
  beforeFocalY?: number;
  afterFocalX?: number;
  afterFocalY?: number;
};

export type ReformulationsContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroText: string;
  heroButton: string;
  heroButtonUrl: string;
  heroImageUrl: string;
  introEyebrow: string;
  introTitle: string;
  introText: string;
  panelEyebrow: string;
  panelTextOne: string;
  panelTextTwo: string;
  panelPoints: ReformulationPoint[];
  portfolioEyebrow: string;
  portfolioTitle: string;
  portfolioText: string;
  /** Placeholder de seção vazia — some quando há casos completos. */
  caseNote: string;
  possibilitiesEyebrow: string;
  possibilitiesTitle: string;
  possibilitiesText: string;
  possibilityCards: ReformulationCard[];
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  ctaButtonUrl: string;
  hiddenSections?: string[];
};

export const defaultReformulationsContent: ReformulationsContent = {
  heroEyebrow: "Reformulação · reconstrução · aprimoramento",
  heroTitle: "Reformulações",
  heroText: "Um novo projeto criado a partir da tattoo que você já tem, para melhorar desenho, composição e leitura sem apagar sua história.",
  heroButton: "Quero avaliar minha tattoo",
  heroButtonUrl: "/orcamento",
  heroImageUrl: "/assets/hero-reformulacoes.png",
  introEyebrow: "Reconstruir para evoluir",
  introTitle: "A tattoo continua sendo sua. O desenho evolui.",
  introText: "Partimos do desenho existente para corrigir, reorganizar e aprimorar o que já está na sua pele.",
  panelEyebrow: "Análise individual",
  panelTextOne: "A reformulação começa com uma leitura cuidadosa da tattoo atual: desenho, linhas, pigmento, cicatrização e região do corpo.",
  panelTextTwo: "A partir disso, reconstruímos o trabalho existente para chegar a uma versão mais equilibrada, coerente e próxima do que você deseja levar na pele.",
  panelPoints: [
    { id: "ponto-1", label: "Desenho original", active: true, order: 1 },
    { id: "ponto-2", label: "Linhas e proporções", active: true, order: 2 },
    { id: "ponto-3", label: "Integração no corpo", active: true, order: 3 },
  ],
  portfolioEyebrow: "Portfólio de reformulações",
  portfolioTitle: "A evolução de cada desenho",
  portfolioText: "Cada caso será apresentado com a tattoo original e o resultado depois da reconstrução, mantendo o antes e o depois lado a lado.",
  caseNote: "Fotos reais do processo serão adicionadas neste espaço.",
  possibilitiesEyebrow: "Possibilidades",
  possibilitiesTitle: "Como a tattoo pode evoluir",
  possibilitiesText: "A solução respeita o desenho que já existe e aquilo que você deseja melhorar nele.",
  possibilityCards: [
    { id: "possib-1", active: true, order: 1, title: "Reconstrução do desenho", text: "A estrutura existente é redesenhada para recuperar formas, intenção e uma leitura mais clara na pele." },
    { id: "possib-2", active: true, order: 2, title: "Correção e equilíbrio", text: "Linhas, proporções, pesos e contrastes são ajustados para melhorar a composição sem apagar sua essência." },
    { id: "possib-3", active: true, order: 3, title: "Ampliação e integração", text: "Novos elementos podem completar o desenho e integrar a tattoo existente a uma composição mais bem resolvida." },
  ],
  ctaTitle: "Vamos reconstruir e melhorar sua tattoo?",
  ctaText: "Envie uma foto e conte o que você gostaria de ajustar. A avaliação de cada reformulação é feita de forma individual.",
  ctaButton: "Quero avaliar minha tattoo",
  ctaButtonUrl: "/orcamento",
};

/** Fallback se a API falhar — casos sem foto (placeholders). */
export const defaultReformulationCases: ReformulationCase[] = [
  { id: "reform-1", order: 1, active: true, title: "Cobertura botânica", description: "Releitura com folhagens e novas linhas.", category: "Cobertura", status: "Publicado", beforeImageUrl: "", afterImageUrl: "" },
  { id: "reform-2", order: 2, active: true, title: "Renovação ornamental", description: "Redesenho e recuperação de contraste.", category: "Revitalização", status: "Publicado", beforeImageUrl: "", afterImageUrl: "" },
];

function mapReformulationCases(items: PublicGalleryItem[]): ReformulationCase[] {
  return items
    .filter((item) => Boolean(item.image_url && item.after_image_url))
    .map((item, index) => ({
      id: item.id,
      order: item.sort_order ?? index,
      active: true,
      title: item.title,
      category: item.category?.trim() || "Reformulação",
      status: "Publicado",
      beforeImageUrl: item.image_url,
      afterImageUrl: item.after_image_url ?? undefined,
      beforeFocalX: item.focal_x ?? 50,
      beforeFocalY: item.focal_y ?? 50,
      afterFocalX: item.after_focal_x ?? 50,
      afterFocalY: item.after_focal_y ?? 50,
    }));
}

export function useReformulationsContent(): ReformulationsContent {
  const [data, setData] = useState<ReformulationsContent>(defaultReformulationsContent);

  useEffect(() => {
    let active = true;
    void Promise.resolve(defaultReformulationsContent).then((next) => {
      if (active) setData(next);
    });
    return () => {
      active = false;
    };
  }, []);

  return data;
}

export function useReformulationCases(): ReformulationCase[] {
  const [items, setItems] = useState<ReformulationCase[]>([]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/gallery/reformulacoes", {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { items?: PublicGalleryItem[] };
        if (!active) return;
        const rows = Array.isArray(data.items) ? data.items : [];
        setItems(mapReformulationCases(rows));
      } catch {
        if (!active) return;
        setItems(defaultReformulationCases);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return [...items]
    .filter((item) => item.active && item.status !== "Oculto")
    .sort((a, b) => a.order - b.order);
}
