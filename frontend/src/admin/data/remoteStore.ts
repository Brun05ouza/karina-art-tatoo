import { adminFetch } from "../auth/adminApi";
import type { DocumentStore, Repository } from "./repository";

type ContentEntry<T> = { key: string; value: T; updatedAt: string };

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

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

export function createRemoteRepository<T extends { id: string; order: number }>(key: string, fallback: T[]): Repository<T> {
  const readAll = async () => {
    const entry = await adminFetch<ContentEntry<T[]>>(`/api/content/${key}`, { treat404AsNull: true, allowUnauthorized: true });
    const items = Array.isArray(entry?.value) ? entry.value : fallback;
    return clone(items).sort((a, b) => a.order - b.order);
  };

  const writeAll = async (items: T[]) => {
    const ordered = clone(items).sort((a, b) => a.order - b.order);
    await adminFetch<ContentEntry<T[]>>(`/api/content/${key}`, {
      method: "PUT",
      body: JSON.stringify({ value: ordered }),
    });
    return ordered;
  };

  return {
    async list() {
      return readAll();
    },
    async get(id) {
      return (await readAll()).find((item) => item.id === id) ?? null;
    },
    async create(input) {
      const items = await readAll();
      const item = { ...input, id: crypto.randomUUID() } as T;
      await writeAll([...items, item]);
      return clone(item);
    },
    async update(id, patch) {
      const items = await readAll();
      const index = items.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("Item não encontrado.");
      const updated = { ...items[index], ...patch } as T;
      items[index] = updated;
      await writeAll(items);
      return clone(updated);
    },
    async remove(id) {
      await writeAll((await readAll()).filter((item) => item.id !== id));
    },
    async reorder(ids) {
      const positions = new Map(ids.map((id, index) => [id, index + 1]));
      const items = (await readAll()).map((item) => ({ ...item, order: positions.get(item.id) ?? item.order }));
      await writeAll(items);
    },
  };
}
