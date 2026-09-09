/** Smoke: login → prepare tiny JPEG → presign → PUT → create → public GET → delete */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const base = process.argv[2] || "http://127.0.0.1:8788";
const origin = base;
const password = process.env.ADMIN_TEMP_PASSWORD;
if (!password) {
  console.error("ADMIN_TEMP_PASSWORD required");
  process.exit(1);
}

// Minimal valid JPEG (1x1)
const jpeg = Buffer.from(
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGfAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEABj8Cf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8hf//Z",
  "base64",
);

async function j(path, opts = {}) {
  const headers = { Origin: origin };
  if (opts.body && !(opts.body instanceof Buffer) && !(opts.body instanceof Blob)) {
    headers["Content-Type"] = "application/json";
  }
  if (opts.contentType) headers["Content-Type"] = opts.contentType;
  if (opts.cookie) headers.Cookie = opts.cookie;
  const res = await fetch(`${base}${path}`, {
    method: opts.method || "GET",
    headers,
    body:
      opts.body instanceof Buffer
        ? opts.body
        : opts.body
          ? JSON.stringify(opts.body)
          : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { status: res.status, json, text, setCookie: res.headers.getSetCookie?.() || [] };
}

const login = await j("/api/admin/login", {
  method: "POST",
  body: { email: "dev@karinasarte.com.br", password },
});
if (login.status !== 200) {
  console.error("login failed", login.status, login.json);
  process.exit(1);
}
const cookie = login.setCookie.map((c) => c.split(";")[0]).join("; ");
console.log("login ok mustChange=", login.json.mustChangePassword);

const presign = await j("/api/admin/uploads/presign", {
  method: "POST",
  cookie,
  body: { collection: "portfolio", contentType: "image/jpeg" },
});
console.log("presign", presign.status, presign.json.path);
if (presign.status !== 200) process.exit(1);

const put = await fetch(presign.json.signedUrl, {
  method: "PUT",
  headers: { "Content-Type": "image/jpeg" },
  body: jpeg,
});
console.log("put", put.status, await put.text().then((t) => t.slice(0, 120)));

if (!put.ok) {
  const post = await fetch(presign.json.signedUrl, {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
    body: jpeg,
  });
  console.log("post fallback", post.status, await post.text().then((t) => t.slice(0, 120)));
  if (!post.ok) process.exit(1);
}

const create = await j("/api/admin/gallery/portfolio", {
  method: "POST",
  cookie,
  body: {
    title: "Smoke Upload",
    category: "Teste",
    image_url: presign.json.publicUrl,
    image_key: presign.json.path,
    published: true,
  },
});
console.log("create", create.status, create.json.item?.id);

const pub = await j("/api/gallery/portfolio");
console.log(
  "public",
  pub.status,
  "items",
  pub.json.items?.length,
  "has_key",
  JSON.stringify(pub.json).includes("image_key"),
);

if (create.json.item?.id) {
  const del = await j(`/api/admin/gallery/item/${create.json.item.id}`, {
    method: "DELETE",
    cookie,
  });
  console.log("delete", del.status, del.json);
}
