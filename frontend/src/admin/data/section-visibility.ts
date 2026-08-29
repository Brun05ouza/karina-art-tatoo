/** Seções marcadas no admin para não aparecerem no site (o conteúdo continua editável). */
export type WithHiddenSections = {
  hiddenSections?: string[];
};

export const PAGE_VISIBILITY_ID = "page";

export function getHiddenSections(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  const list = (value as WithHiddenSections).hiddenSections;
  return Array.isArray(list) ? list.filter((item): item is string => typeof item === "string") : [];
}

export function isPageVisible(value: unknown): boolean {
  return !getHiddenSections(value).includes(PAGE_VISIBILITY_ID);
}

export function setSectionHidden(hiddenSections: string[], sectionId: string, hidden: boolean): string[] {
  const next = new Set(hiddenSections);
  if (hidden) next.add(sectionId);
  else next.delete(sectionId);
  return [...next];
}
