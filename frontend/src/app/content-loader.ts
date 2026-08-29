const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3333").replace(/\/$/, "");

type CacheEntry<T> = {
  status: "loading" | "ready";
  value: T;
  promise: Promise<T>;
};

const cache = new Map<string, CacheEntry<unknown>>();

export function preloadImage(url: string | null | undefined, timeoutMs = 4000): Promise<void> {
  const src = typeof url === "string" ? url.trim() : "";
  if (!src || src.startsWith("data:")) return Promise.resolve();

  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    const timer = window.setTimeout(finish, timeoutMs);
    img.onload = () => {
      window.clearTimeout(timer);
      finish();
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      finish();
    };
    img.decoding = "async";
    img.src = src;
  });
}

export function preloadImages(urls: Array<string | null | undefined>, timeoutMs = 4000): Promise<void> {
  const unique = [...new Set(urls.filter((url): url is string => Boolean(url && String(url).trim())))];
  if (!unique.length) return Promise.resolve();
  return Promise.all(unique.map((url) => preloadImage(url, timeoutMs))).then(() => undefined);
}

async function fetchContentValue<T>(key: string, fallback: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${API_URL}/api/content/${key}`, { signal: controller.signal });
    window.clearTimeout(timeout);
    if (!response.ok) return fallback;
    const entry = (await response.json()) as { value?: T } | null;
    if (entry?.value == null) return fallback;
    if (Array.isArray(fallback) && !Array.isArray(entry.value)) return fallback;
    if (Array.isArray(fallback)) return entry.value;
    if (typeof fallback === "object" && fallback && typeof entry.value === "object") {
      return { ...fallback, ...entry.value };
    }
    return entry.value;
  } catch {
    return fallback;
  }
}

export function ensureContent<T>(key: string, fallback: T): Promise<T> {
  const existing = cache.get(key) as CacheEntry<T> | undefined;
  if (existing) return existing.promise;

  const promise = fetchContentValue(key, fallback).then((value) => {
    const entry = cache.get(key) as CacheEntry<T> | undefined;
    if (entry) {
      entry.status = "ready";
      entry.value = value;
    }
    return value;
  });

  cache.set(key, { status: "loading", value: fallback, promise });
  return promise;
}

export function peekContent<T>(key: string, fallback: T): T {
  const existing = cache.get(key) as CacheEntry<T> | undefined;
  return existing?.status === "ready" ? existing.value : fallback;
}

export function isContentReady(key: string): boolean {
  return cache.get(key)?.status === "ready";
}
