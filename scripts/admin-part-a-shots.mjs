import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const OUT = join(process.cwd(), "tmp", "admin-part-a");
mkdirSync(OUT, { recursive: true });
const EMAIL = process.env.ADMIN_SHOT_EMAIL || "dev@karinasarte.com.br";
const PASS = process.env.ADMIN_SHOT_PASS || "";
if (!PASS) {
  console.error("Defina ADMIN_SHOT_PASS");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage();
page.setDefaultTimeout(20000);

await page.goto("http://127.0.0.1:8788/admin/login", { waitUntil: "domcontentloaded" });
await page.fill('input[type="email"]', EMAIL);
await page.fill('input[type="password"]', PASS);
await page.click('button[type="submit"]');
await page.waitForSelector(".ks-admin-workspace");

const shots = [
  { path: "/admin/galeria/portfolio", name: "list", w: 1440 },
  { path: "/admin/galeria/portfolio", name: "list-ipad", w: 768 },
  { path: "/admin/galeria/portfolio", name: "list-phone", w: 390 },
];

for (const s of shots) {
  await page.setViewportSize({ width: s.w, height: 900 });
  await page.goto(`http://127.0.0.1:8788${s.path}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(OUT, `${s.name}-${s.w}.png`), fullPage: false });
}

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto("http://127.0.0.1:8788/admin/galeria/portfolio", { waitUntil: "domcontentloaded" });
await page.getByRole("button", { name: /Adicionar/i }).first().click();
await page.waitForSelector(".ks-gallery-drop");
await page.waitForTimeout(400);
await page.screenshot({ path: join(OUT, "form-1440.png"), fullPage: false });

await page.setViewportSize({ width: 390, height: 900 });
await page.waitForTimeout(400);
await page.screenshot({ path: join(OUT, "form-390.png"), fullPage: false });

await browser.close();
console.log("done", OUT);
