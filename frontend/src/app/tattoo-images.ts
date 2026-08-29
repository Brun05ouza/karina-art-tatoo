/**
 * Assets locais permitidos no código (não vêm do CMS).
 * - Estrelas da marca: BrandStar / StarGlyph / CSS section stars
 * - Olho com coração: /assets/brand/eye-heart.png (CTA)
 * - Estúdio: frames/session mantidos temporariamente para o tour
 *
 * Fotos de trabalho, heroes e cards devem vir do admin.
 */
const studioImages = {
  wide: "/assets/session/frame-120.webp",
  detail: "/assets/session/frame-241.webp",
} as const;

/** Referências de estúdio (temporárias). Demais mídias: string vazia no CMS. */
export const tattooImages = {
  sessionWide: studioImages.wide,
  sessionClose: studioImages.detail,
  studioWide: studioImages.wide,
  studioDetail: studioImages.detail,
} as const;

export type TattooImageKey = keyof typeof tattooImages;
