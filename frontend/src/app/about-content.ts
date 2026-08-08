import { useEffect, useState } from "react";
import { tattooImages } from "./tattoo-images";

/**
 * Conteúdo da página /sobre vindo do admin (Neon, key "sobre") — mesma
 * separação de home-content.ts: tipo e cópia padrão próprios deste arquivo,
 * sem importar de src/admin.
 */
export type AboutCard = {
  id: string;
  title: string;
  text: string;
  active: boolean;
  order: number;
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
};

/** Cópia publicada hoje — primeiro paint e base enquanto o Neon não responde. */
export const defaultAboutContent: AboutContent = {
  eyebrow: "A artista",
  title: "Sobre a Karina Sarte",
  intro: "Karina Sarte cria projetos que unem arte, identidade e cuidado. Cada tattoo é pensada de forma personalizada, respeitando a história, o corpo e o estilo de quem escolhe levar aquela arte na pele.",
  heroImageUrl: tattooImages.heroAbout,

  biography: "Minha estética é autoral, com traço fino e referências botânicas. Construo projetos que equilibram delicadeza e presença. Todo atendimento começa com escuta: quero entender suas referências, as proporções e o significado por trás da ideia.\n\nEm Teresópolis, criei um espaço de criação e cuidado. Da primeira mensagem à cicatrização, acompanho cada etapa com orientação clara e muita atenção.",
  quote: "Em cada traço, coloco intenção. A tattoo precisa conversar com quem você é e com o corpo que a recebe.",
  imageUrl: tattooImages.artistTattooing,

  approachCards: [
    { id: "1", title: "Processo criativo", text: "Penso cada projeto como uma conversa entre sua história, seu corpo e minha linguagem visual.", active: true, order: 1 },
    { id: "2", title: "Atendimento cuidadoso", text: "Escuto com calma desde a primeira mensagem para entender o que você quer levar na pele.", active: true, order: 2 },
    { id: "3", title: "Ambiente seguro", text: "Trabalho com materiais adequados, biossegurança e orientações claras em cada etapa.", active: true, order: 3 },
  ],

  behindScenesImageUrl: "",
  behindScenesCaption: "Língua de fora, mão firme: é assim que uma borboleta nasce no tablet antes de virar tattoo.",
};

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3333").replace(/\/$/, "");

export function useAboutContent(): AboutContent {
  const [data, setData] = useState<AboutContent>(defaultAboutContent);

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/api/content/sobre`)
      .then((response) => (response.ok ? response.json() : null))
      .then((entry: { value?: Partial<AboutContent> } | null) => {
        if (active && entry?.value) setData({ ...defaultAboutContent, ...entry.value });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return data;
}
