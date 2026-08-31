import { API_URL } from "../lib/api-base";

type CacheEntry<T> = {
  status: "loading" | "ready";
  value: T;
  promise: Promise<T>;
};

const cache = new Map<string, CacheEntry<unknown>>();

const FETCH_TIMEOUT_MS = 12_000;
const FETCH_RETRIES = 3;

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

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

function mergeFetchedValue<T>(fallback: T, value: T): T {
  if (Array.isArray(fallback) && !Array.isArray(value)) return fallback;
  if (Array.isArray(fallback)) return value;
  if (typeof fallback === "object" && fallback && typeof value === "object" && value) {
    return { ...fallback, ...value };
  }
  return value;
}

async function fetchContentValueOnce<T>(key: string, signal: AbortSignal): Promise<T | null> {
  const response = await fetch(`${API_URL}/api/content/${key}`, { signal });
  if (!response.ok) return null;
  const entry = (await response.json()) as { value?: T } | null;
  if (entry?.value == null) return null;
  return entry.value;
}

async function fetchContentValue<T>(key: string, fallback: T): Promise<T> {
  for (let attempt = 0; attempt < FETCH_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const value = await fetchContentValueOnce<T>(key, controller.signal);
      window.clearTimeout(timeout);
      if (value != null) return mergeFetchedValue(fallback, value);
    } catch {
      window.clearTimeout(timeout);
    }

    if (attempt < FETCH_RETRIES - 1) {
      await sleep(900 * (attempt + 1));
    }
  }

  return fallback;
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
