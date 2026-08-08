import { adminFetch } from "../auth/adminApi";
import type { DocumentStore } from "./repository";

type ContentEntry<T> = { key: string; value: T; updatedAt: string };

/**
 * Documento salvo em /api/content/<key> (Neon), uma linha por chave — ver
 * backend/src/routes/content.ts. O valor é o documento inteiro em JSON, sem
 * tabela por campo.
 */
export function createRemoteDocumentStore<T extends Record<string, unknown>>(key: string, fallback: T): DocumentStore<T> {
  return {
    async read() {
      const entry = await adminFetch<ContentEntry<T>>(`/api/content/${key}`, { treat404AsNull: true, allowUnauthorized: true });
      if (!entry) return { ...fallback };
      // Mescla com o fallback para que campos acrescentados depois do documento
      // ser salvo tenham valor padrão, em vez de aparecerem vazios no formulário.
      return { ...fallback, ...entry.value };
    },
    async write(value) {
      const entry = await adminFetch<ContentEntry<T>>(`/api/content/${key}`, {
        method: "PUT",
        body: JSON.stringify({ value }),
      });
      return entry.value;
    },
  };
}
