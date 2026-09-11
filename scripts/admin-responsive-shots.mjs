import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const OUT = join(process.cwd(), "tmp", "admin-responsive");
mkdirSync(OUT, { recursive: true });

const EMAIL = process.env.ADMIN_SHOT_EMAIL || "dev@karinasarte.com.br";
const PASS = process.env.ADMIN_SHOT_PASS || "";
if (!PASS) {
  console.error("Defina ADMIN_SHOT_PASS");
  process.exit(1);
}

const widths = [
  { w: 1440, name: "1440-desktop" },
  { w: 1024, name: "1024-ipad-landscape" },
  { w: 768, name: "768-ipad-portrait" },
  { w: 390, name: "390-phone" },
];

const browser = await chromium.launch();
const page = await browser.newPage();
page.setDefaultTimeout(20000);

await page.goto("http://127.0.0.1:8788/admin/login", { waitUntil: "domcontentloaded" });
await page.fill('input[type="email"]', EMAIL);
await page.fill('input[type="password"]', PASS);
await page.click('button[type="submit"]');
await page.waitForSelector(".ks-admin-workspace", { timeout: 15000 });
await page.goto("http://127.0.0.1:8788/admin", { waitUntil: "domcontentloaded" });
await page.waitForSelector("text=Suas galerias");

for (const { w, name } of widths) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: false });
  console.log("saved", name);
}

await page.goto("http://127.0.0.1:8788/admin/usuarios", { waitUntil: "domcontentloaded" });
await page.setViewportSize({ width: 390, height: 900 });
await page.waitForTimeout(400);
await page.screenshot({ path: join(OUT, "390-users-stats.png"), fullPage: false });

await browser.close();
console.log("done", OUT);
