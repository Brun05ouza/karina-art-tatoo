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
