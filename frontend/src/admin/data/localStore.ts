import type { DocumentStore, Repository } from "./repository";

const PREFIX = "ks-admin-draft:";
const wait = () => new Promise((resolve) => window.setTimeout(resolve, 140));

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function readValue<T>(key: string, fallback: T): T {
  const raw = window.localStorage.getItem(`${PREFIX}${key}`);
  if (!raw) return clone(fallback);
  try {
    return JSON.parse(raw) as T;
  } catch {
    return clone(fallback);
  }
}

function writeValue<T>(key: string, value: T): T {
  window.localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  return clone(value);
}

export function createLocalRepository<T extends { id: string; order: number }>(key: string, mocks: T[]): Repository<T> {
  return {
    async list() {
      await wait();
      return readValue(key, mocks).sort((a, b) => a.order - b.order);
    },
    async get(id) {
      await wait();
      return readValue(key, mocks).find((item) => item.id === id) ?? null;
    },
    async create(input) {
      await wait();
      const items = readValue(key, mocks);
      const item = { ...input, id: crypto.randomUUID() } as T;
      writeValue(key, [...items, item]);
      // TODO(neon): PUT /api/content/<key> com a coleção completa.
      return clone(item);
    },
    async update(id, patch) {
      await wait();
      const items = readValue(key, mocks);
      const index = items.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("Item não encontrado.");
      const updated = { ...items[index], ...patch } as T;
      items[index] = updated;
      writeValue(key, items);
      // TODO(neon): PUT /api/content/<key> com a coleção completa.
      return clone(updated);
    },
    async remove(id) {
      await wait();
      writeValue(key, readValue(key, mocks).filter((item) => item.id !== id));
      // TODO(neon): PUT /api/content/<key> após remover; apagar imageKey no R2 quando existir.
    },
    async reorder(ids) {
      await wait();
      const positions = new Map(ids.map((id, index) => [id, index + 1]));
      const items = readValue(key, mocks).map((item) => ({ ...item, order: positions.get(item.id) ?? item.order }));
      writeValue(key, items);
      // TODO(neon): PUT /api/content/<key> com a nova ordem.
    },
  };
}

export function createLocalDocumentStore<T>(key: string, mock: T): DocumentStore<T> {
  return {
    async read() {
      await wait();
      // TODO(neon): GET /api/content/<key>
      const stored = readValue(key, mock);
      // Mescla com o mock para que campos acrescentados depois do rascunho ser
      // salvo tenham valor padrão, em vez de aparecerem vazios no formulário.
      if (stored && typeof stored === "object" && !Array.isArray(stored)) {
        return { ...(mock as Record<string, unknown>), ...(stored as Record<string, unknown>) } as T;
      }
      return stored;
    },
    async write(value) {
      await wait();
      // TODO(neon): PUT /api/content/<key>
      return writeValue(key, value);
    },
  };
}

export function resetToMocks() {
  const keys = Object.keys(window.localStorage).filter((key) => key.startsWith(PREFIX));
  keys.forEach((key) => window.localStorage.removeItem(key));
}
