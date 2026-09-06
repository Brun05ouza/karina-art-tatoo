export type SiteModeContent = {
  developmentMode: boolean;
  developmentEyebrow: string;
  developmentTitle: string;
  developmentText: string;
  developmentImageUrl: string;
  developmentButton: string;
  developmentButtonUrl: string;
  loaded?: boolean;
};

export const defaultSiteModeContent: SiteModeContent = {
  developmentMode: false,
  developmentEyebrow: "Karina Sarte",
  developmentTitle: "Esse site está em desenvolvimento",
  developmentText: "Estou preparando esse espaço com carinho. Em breve tudo aparece por aqui com mais detalhes, arte e intenção.",
  developmentImageUrl: "",
  developmentButton: "Falar comigo no WhatsApp",
  developmentButtonUrl: "https://wa.me/5521990724477?text=Oi%2C%20Karina%21%20Vim%20pelo%20site%20e%20queria%20falar%20com%20voc%C3%AA.",
};

export function useSiteModeContent(): SiteModeContent {
  return { ...defaultSiteModeContent, loaded: true };
}
