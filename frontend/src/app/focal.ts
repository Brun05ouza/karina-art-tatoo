/** Ponto focal 0–100 para object-position / background-position. */

import type { CSSProperties } from "react";

export type FocalPoint = { x: number; y: number };

export const DEFAULT_FOCAL: FocalPoint = { x: 50, y: 50 };

export function clampFocal(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function normalizeFocal(x?: number | null, y?: number | null): FocalPoint {
  return {
    x: clampFocal(x ?? 50),
    y: clampFocal(y ?? 50),
  };
}

/** Variáveis CSS + object-position para imgs com object-fit: cover. */
export function focalStyle(x?: number | null, y?: number | null): CSSProperties {
  const f = normalizeFocal(x, y);
  return {
    ["--focal-x" as string]: `${f.x}%`,
    ["--focal-y" as string]: `${f.y}%`,
    objectPosition: `${f.x}% ${f.y}%`,
  };
}

export function focalBackgroundStyle(x?: number | null, y?: number | null): CSSProperties {
  const f = normalizeFocal(x, y);
  return {
    ["--focal-x" as string]: `${f.x}%`,
    ["--focal-y" as string]: `${f.y}%`,
    backgroundPosition: `${f.x}% ${f.y}%`,
  };
}

/**
 * Eixos em que a imagem (cover) ultrapassa o quadro.
 * Se ratio imagem === ratio quadro, nenhum eixo move.
 */
export function coverPanAxes(
  imageW: number,
  imageH: number,
  boxW: number,
  boxH: number,
): { canX: boolean; canY: boolean; overflowX: number; overflowY: number } {
  if (imageW <= 0 || imageH <= 0 || boxW <= 0 || boxH <= 0) {
    return { canX: false, canY: false, overflowX: 0, overflowY: 0 };
  }
  const imageRatio = imageW / imageH;
  const boxRatio = boxW / boxH;
  const epsilon = 0.01;

  if (Math.abs(imageRatio - boxRatio) < epsilon) {
    return { canX: false, canY: false, overflowX: 0, overflowY: 0 };
  }

  if (imageRatio > boxRatio) {
    // Paisagem no quadro: escala pela altura → sobra nas laterais
    const renderedW = boxH * imageRatio;
    const overflowX = Math.max(0, renderedW - boxW);
    return { canX: overflowX > 0.5, canY: false, overflowX, overflowY: 0 };
  }

  // Retrato no quadro: escala pela largura → sobra em cima/baixo
  const renderedH = boxW / imageRatio;
  const overflowY = Math.max(0, renderedH - boxH);
  return { canX: false, canY: overflowY > 0.5, overflowX: 0, overflowY };
}
