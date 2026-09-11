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
  developmentButtonUrl: "",
};

export function useSiteModeContent(): SiteModeContent {
  return { ...defaultSiteModeContent, loaded: true };
}
