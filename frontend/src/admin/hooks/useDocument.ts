import { useCallback, useEffect, useState } from "react";
import type { DocumentStore } from "../data/repository";

export function useDocument<T>(store: DocumentStore<T>) {
  const [value, setValue] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setValue(await store.read());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  }, [store]);

  useEffect(() => { void reload(); }, [reload]);

  const save = useCallback(async (next: T) => {
    const saved = await store.write(next);
    setValue(saved);
    return saved;
  }, [store]);

  return { value, setValue, loading, error, reload, save };
}
