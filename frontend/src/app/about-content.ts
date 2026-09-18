import { useEffect, useState } from "react";

/**
 * Conteúdo da página /sobre vindo do admin (Neon, key "sobre") — mesma
 * separação de home-content.ts: tipo e cópia padrão próprios deste arquivo,
 * sem importar de src/admin. Mídia vem do CMS (defaults de imagem vazios).
 */
export type AboutCard = {
  id: string;
  title: string;
  text: string;
  active: boolean;
  order: number;
};

export type AboutStudioStep = {
  id: string;
  order: number;
  active: boolean;
  label: string;
  title: string;
  text: string;
  imageUrl: string;
};

export type AboutContent = {
  eyebrow: string;
  title: string;
  intro: string;
  heroImageUrl: string;

  biography: string;
  quote: string;
  imageUrl: string;

  approachCards: AboutCard[];

  behindScenesImageUrl: string;
  behindScenesCaption: string;

  studioInviteImageUrl: string;
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

function mergeStudioSteps(incoming?: Partial<AboutStudioStep>[] | null): AboutStudioStep[] {
  if (!Array.isArray(incoming) || incoming.length === 0) return defaultAboutContent.studioTourSteps;

  return incoming.map((step, index) => {
    const fallback = defaultAboutContent.studioTourSteps[index] ?? defaultAboutContent.studioTourSteps[0]!;
    return {
      id: step.id || fallback.id,
      order: typeof step.order === "number" ? step.order : index + 1,
      active: step.active !== false,
      label: step.label || fallback.label,
      title: step.title || fallback.title,
      text: step.text || fallback.text,
      imageUrl: step.imageUrl || fallback.imageUrl,
    };
  });
}

export function useAboutContent(): AboutContent {
  const [data, setData] = useState<AboutContent>(defaultAboutContent);

  useEffect(() => {
    let active = true;
    void Promise.resolve(defaultAboutContent).then((next) => {
      if (active) setData(next);
    });
    return () => {
      active = false;
    };
  }, []);

  return data;
}
