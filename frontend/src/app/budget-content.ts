import { useEffect, useState } from "react";
import { API_URL } from "../lib/api-base";

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
  hiddenSections?: string[];
};

export const defaultBudgetPageContent: BudgetPageContent = {
  heroKicker: "Orçamento",
  heroTitle: "Me conta a sua ideia?",
  heroText: "Me manda suas referências, o local do corpo, o tamanho aproximado e tudo que você já imaginou. Com esse contexto eu consigo entender o desenho com cuidado e te orientar pelo WhatsApp.",
  heroImageUrl: "",

  introEyebrow: "Briefing inicial",
  introTitle: "Quanto mais você me conta, melhor eu consigo te orientar.",
  introText: "Não precisa chegar com tudo fechado. Pode me mandar uma ideia solta, referências, dúvidas e o que você sente que combina com você — eu organizo o caminho a partir disso.",

  stepOneTitle: "Me conta a ideia",
  stepOneText: "Escreve do seu jeito: tema, referências, estilo, tamanho e onde você imagina tatuar.",
  stepTwoTitle: "Eu analiso com calma",
  stepTwoText: "Olho proporção, detalhes, encaixe no corpo e o melhor caminho para o desenho funcionar na pele.",
  stepThreeTitle: "Te respondo no WhatsApp",
  stepThreeText: "Depois te retorno com orientação inicial, próximos passos e tudo que eu precisar alinhar com você.",

  formEyebrow: "Me chama no WhatsApp",
  formTitle: "Conta pra mim",
  submitHelper: "Ao enviar, eu recebo sua mensagem já organizada no WhatsApp.",
  submitButton: "Enviar para a Karina",
  whatsappIntro: "Oi, Karina! Vim pelo site e queria te contar uma ideia de tattoo ✨",
};

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
