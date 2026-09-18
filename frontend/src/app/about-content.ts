import { useEffect, useState } from "react";

/**
 * Conteúdo da página /sobre — textos ficam neste arquivo (defaults).
 * Imagens vêm do CMS (site_settings.about_media) via /api/settings.
 */
export type AboutCard = {
  id: string;
  title: string;
  text: string;
  active: boolean;
  order: number;
};

export type AboutImageFocal = { x: number; y: number };

export type AboutStudioStep = {
  id: string;
  order: number;
  active: boolean;
  label: string;
  title: string;
  text: string;
  imageUrl: string;
  imageFocal?: AboutImageFocal;
};

export type AboutContent = {
  eyebrow: string;
  title: string;
  intro: string;
  heroImageUrl: string;
  heroImageFocal?: AboutImageFocal;

  biography: string;
  quote: string;
  imageUrl: string;
  imageFocal?: AboutImageFocal;

  approachCards: AboutCard[];

  behindScenesImageUrl: string;
  behindScenesCaption: string;
  behindScenesImageFocal?: AboutImageFocal;

  studioInviteImageUrl: string;
  studioInviteImageFocal?: AboutImageFocal;
  studioTourSteps: AboutStudioStep[];
  hiddenSections?: string[];
};

/** Cópia publicada hoje — primeiro paint e base enquanto o Neon não responde. */
export const defaultAboutContent: AboutContent = {
  eyebrow: "A artista",
  title: "Sobre a Karina Sarte",
  intro: "Karina Sarte cria projetos que unem arte, identidade e cuidado. Cada tattoo é pensada de forma personalizada, respeitando a história, o corpo e o estilo de quem escolhe levar aquela arte na pele.",
  heroImageUrl: "/assets/hero-sobre.webp",

  biography: "Minha estética é autoral, com traço fino e referências botânicas. Construo projetos que equilibram delicadeza e presença. Todo atendimento começa com escuta: quero entender suas referências, as proporções e o significado por trás da ideia.\n\nEm Teresópolis, criei um espaço de criação e cuidado. Da primeira mensagem à cicatrização, acompanho cada etapa com orientação clara e muita atenção.",
  quote: "Crio projetos que abraçam o corpo e são uma extensão da sua personalidade.",
  imageUrl: "/assets/karina-sarte.webp",

  approachCards: [
    { id: "1", title: "Processo criativo", text: "Penso cada projeto como uma conversa entre sua história, seu corpo e minha linguagem visual.", active: true, order: 1 },
    { id: "2", title: "Atendimento cuidadoso", text: "Escuto com calma desde a primeira mensagem para entender o que você quer levar na pele.", active: true, order: 2 },
    { id: "3", title: "Ambiente seguro", text: "Trabalho com materiais adequados, biossegurança e orientações claras em cada etapa.", active: true, order: 3 },
  ],

  behindScenesImageUrl: "/assets/karina-sarte-bastidores.webp",
  behindScenesCaption: "Eu depois de comer strogonoff com feijão e decidir que era uma ótima hora pra criar arte.",

  studioInviteImageUrl: "/assets/studio/entrada.jpeg",
  studioTourSteps: [
    {
      id: "entrada",
      order: 1,
      active: true,
      label: "Entrada",
      title: "Essa é a entrada.",
      text: "É daqui que começa a experiência: um espaço mais íntimo, calmo e preparado para te receber.",
      imageUrl: "/assets/studio/entrada.jpeg",
    },
    {
      id: "espaco",
      order: 2,
      active: true,
      label: "Espaço",
      title: "Meu cantinho de criação.",
      text: "É aqui que eu desenho, organizo referências e preparo cada detalhe antes da tattoo acontecer.",
      imageUrl: "/assets/studio/espaco.jpeg",
    },
    {
      id: "processo",
      order: 3,
      active: true,
      label: "Processo",
      title: "Onde o projeto ganha forma.",
      text: "Entre conversas, traços e ajustes, cada ideia vai encontrando o próprio lugar.",
      imageUrl: "/assets/studio/processo.jpeg",
    },
    {
      id: "vista",
      order: 4,
      active: true,
      label: "Vista",
      title: "Uma vista que acompanha o processo.",
      text: "Meu studio também carrega um pouco de Teresópolis — e isso faz parte do clima do espaço.",
      imageUrl: "/assets/studio/vista.jpeg",
    },
  ],
};

type AboutMediaApiSlot = {
  url?: string;
  key?: string;
  focalX?: number;
  focalY?: number;
};

type AboutMediaApi = {
  heroImage?: AboutMediaApiSlot;
  image?: AboutMediaApiSlot;
  behindScenesImage?: AboutMediaApiSlot;
  studioInviteImage?: AboutMediaApiSlot;
  studioTourSteps?: AboutMediaApiSlot[];
  hiddenSections?: string[];
};

function pickUrl(slot: AboutMediaApiSlot | undefined, fallback: string): string {
  const url = slot?.url?.trim();
  return url || fallback;
}

function pickFocal(slot: AboutMediaApiSlot | undefined): AboutImageFocal | undefined {
  if (!slot?.url?.trim()) return undefined;
  const x = Number(slot.focalX);
  const y = Number(slot.focalY);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return { x: 50, y: 50 };
  return {
    x: Math.min(100, Math.max(0, x)),
    y: Math.min(100, Math.max(0, y)),
  };
}

function mergeAboutMedia(media: AboutMediaApi | null | undefined): AboutContent {
  const base = defaultAboutContent;
  if (!media) return base;

  const tour = base.studioTourSteps.map((step, index) => {
    const slot = media.studioTourSteps?.[index];
    return {
      ...step,
      imageUrl: pickUrl(slot, step.imageUrl),
      imageFocal: pickFocal(slot),
    };
  });

  return {
    ...base,
    heroImageUrl: pickUrl(media.heroImage, base.heroImageUrl),
    heroImageFocal: pickFocal(media.heroImage),
    imageUrl: pickUrl(media.image, base.imageUrl),
    imageFocal: pickFocal(media.image),
    behindScenesImageUrl: pickUrl(media.behindScenesImage, base.behindScenesImageUrl),
    behindScenesImageFocal: pickFocal(media.behindScenesImage),
    studioInviteImageUrl: pickUrl(media.studioInviteImage, base.studioInviteImageUrl),
    studioInviteImageFocal: pickFocal(media.studioInviteImage),
    studioTourSteps: tour,
    hiddenSections: Array.isArray(media.hiddenSections)
      ? media.hiddenSections.filter((item): item is string => typeof item === "string")
      : base.hiddenSections,
  };
}

export function useAboutContent(): AboutContent {
  const [data, setData] = useState<AboutContent>(defaultAboutContent);

  useEffect(() => {
    let active = true;
    void fetch("/api/settings", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return defaultAboutContent;
        const json = (await res.json()) as { aboutMedia?: AboutMediaApi };
        return mergeAboutMedia(json.aboutMedia);
      })
      .then((next) => {
        if (active) setData(next);
      })
      .catch(() => {
        if (active) setData(defaultAboutContent);
      });
    return () => {
      active = false;
    };
  }, []);

  return data;
}
