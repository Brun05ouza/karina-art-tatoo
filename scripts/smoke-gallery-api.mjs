const base = process.argv[2] || "http://127.0.0.1:8788";
const origin = base;

async function req(path, init = {}) {
  const headers = { ...(init.headers || {}) };
  if (init.body) headers["Content-Type"] = "application/json";
  if (init.origin) headers.Origin = origin;
  const res = await fetch(`${base}${path}`, {
    method: init.method || "GET",
    headers,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { status: res.status, headers: res.headers, json, text };
}

const publicGet = await req("/api/gallery/portfolio");
const cache = publicGet.headers.get("cache-control") || "";
const hasKey = JSON.stringify(publicGet.json).includes("image_key");
console.log("public portfolio", publicGet.status, "cache=", cache, "has_image_key=", hasKey);

const bad = await req("/api/gallery/foo");
console.log("bad collection", bad.status, bad.json?.error);

const unauth = await req("/api/admin/gallery/portfolio", { origin: true });
console.log("admin unauth", unauth.status, unauth.json?.error);

const unauthPost = await req("/api/admin/gallery/portfolio", {
  method: "POST",
  origin: true,
  body: { title: "x" },
});
console.log("admin post unauth", unauthPost.status);

const unauthPresign = await req("/api/admin/uploads/presign", {
  method: "POST",
  origin: true,
  body: { collection: "portfolio", contentType: "image/jpeg" },
});
console.log("presign unauth", unauthPresign.status);
