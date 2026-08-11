import { useEffect, useState } from "react";
import { tattooImages } from "./tattoo-images";

export type BudgetPageContent = {
  heroKicker: string;
  heroTitle: string;
  heroText: string;
  heroImageUrl: string;

  introEyebrow: string;
  introTitle: string;
  introText: string;

  stepOneTitle: string;
  stepOneText: string;
  stepTwoTitle: string;
  stepTwoText: string;
  stepThreeTitle: string;
  stepThreeText: string;

  formEyebrow: string;
  formTitle: string;
  submitHelper: string;
  submitButton: string;
  whatsappIntro: string;
};

export const defaultBudgetPageContent: BudgetPageContent = {
  heroKicker: "Orçamento",
  heroTitle: "Vamos criar sua próxima tattoo?",
  heroText: "Envie sua ideia, referências, tamanho aproximado e local do corpo. A Karina Sarte analisa sua proposta e orienta o melhor caminho para transformar sua ideia em arte na pele.",
  heroImageUrl: tattooImages.heroBudget,

  introEyebrow: "Briefing inicial",
  introTitle: "Quanto mais contexto, mais certeiro fica o orçamento.",
  introText: "Não precisa ter tudo fechado. A ideia é reunir as informações principais para a Karina entender o desenho, o corpo e o caminho visual antes de te responder.",

  stepOneTitle: "Você envia o briefing",
  stepOneText: "Conta a ideia com o máximo de contexto que tiver.",
  stepTwoTitle: "Karina analisa",
  stepTwoText: "Ela entende estilo, proporção, local do corpo e complexidade.",
  stepThreeTitle: "Resposta no WhatsApp",
  stepThreeText: "Você recebe orientação inicial e próximos passos.",

  formEyebrow: "Enviar para WhatsApp",
  formTitle: "Conte sua ideia",
  submitHelper: "O formulário abre uma conversa pronta no WhatsApp da Karina.",
  submitButton: "Chamar no WhatsApp",
  whatsappIntro: "Olá, Karina Sarte! Vim pelo site e queria fazer um orçamento de tattoo ✨",
};

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3333").replace(/\/$/, "");

export function useBudgetPageContent(): BudgetPageContent {
  const [data, setData] = useState<BudgetPageContent>(defaultBudgetPageContent);

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/api/content/budget-page`)
      .then((response) => (response.ok ? response.json() : null))
      .then((entry: { value?: Partial<BudgetPageContent> } | null) => {
        if (active && entry?.value) setData({ ...defaultBudgetPageContent, ...entry.value });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return data;
}
