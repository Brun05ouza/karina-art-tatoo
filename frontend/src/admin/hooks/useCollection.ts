import { useCallback, useEffect, useState } from "react";
import type { Repository } from "../data/repository";

export function useCollection<T extends { id: string; order: number }>(repository: Repository<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await repository.list());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => { void reload(); }, [reload]);

  const save = useCallback(async (item: T) => {
    const exists = items.some((current) => current.id === item.id);
    if (exists) await repository.update(item.id, item);
    else {
      const { id: _id, ...input } = item;
      await repository.create(input as Omit<T, "id">);
    }
    await reload();
  }, [items, reload, repository]);

  const remove = useCallback(async (id: string) => {
    await repository.remove(id);
    await reload();
  }, [reload, repository]);

  const move = useCallback(async (id: string, direction: -1 | 1) => {
    const ordered = [...items].sort((a, b) => a.order - b.order);
    const index = ordered.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    setItems(ordered.map((item, position) => ({ ...item, order: position + 1 })));
    await repository.reorder(ordered.map((item) => item.id));
  }, [items, repository]);

  return { items, loading, error, reload, save, remove, move };
}
