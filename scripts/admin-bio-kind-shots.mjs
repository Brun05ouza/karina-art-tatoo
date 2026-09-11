import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const OUT = join(process.cwd(), "tmp", "admin-bio-kind");
mkdirSync(OUT, { recursive: true });
const BASE = process.env.ADMIN_SHOT_BASE || "http://127.0.0.1:8788";
const EMAIL = process.env.ADMIN_SHOT_EMAIL || "dev@karinasarte.com.br";
const PASS = process.env.ADMIN_SHOT_PASS || "";
if (!PASS) {
  console.error("Defina ADMIN_SHOT_PASS");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage();
page.setDefaultTimeout(25000);

await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded" });
await page.fill('input[type="email"]', EMAIL);
await page.fill('input[type="password"]', PASS);
await page.click('button[type="submit"]');
await page.waitForTimeout(800);

if (page.url().includes("password") || (await page.locator("text=nova senha").count()) > 0) {
  const next = "RosaNoAtelie2026!";
  const fields = page.locator('input[type="password"]');
  const count = await fields.count();
  // current + new + confirm, or just new + confirm
  if (count >= 3) {
    await fields.nth(0).fill(PASS);
    await fields.nth(1).fill(next);
    await fields.nth(2).fill(next);
  } else {
    await fields.nth(0).fill(next);
    await fields.nth(1).fill(next);
  }
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);
}

await page.goto(`${BASE}/admin/bio-links`, { waitUntil: "domcontentloaded" });
await page.waitForSelector(".ks-bio-phone-card, .ks-bio-list", { timeout: 15000 });
await page.waitForTimeout(600);

for (const w of [1440, 1024, 768, 390]) {
  await page.setViewportSize({ width: w, height: 900 });
  if (w < 1024) {
    const toggle = page.locator(".ks-bio-preview-toggle");
    if ((await toggle.count()) && !(await page.locator(".ks-bio-preview-aside.is-open").count())) {
      await toggle.click();
      await page.waitForTimeout(300);
    }
  }
  await page.screenshot({ path: join(OUT, `list-${w}.png`), fullPage: true });
}

await page.setViewportSize({ width: 1440, height: 900 });
await page.getByRole("button", { name: /Adicionar link/i }).click();
await page.waitForSelector(".ks-bio-kind-grid");
await page.waitForTimeout(400);
await page.screenshot({ path: join(OUT, "form-1440.png"), fullPage: true });

await page.setViewportSize({ width: 390, height: 900 });
await page.waitForTimeout(300);
await page.screenshot({ path: join(OUT, "form-390.png"), fullPage: true });

await browser.close();
console.log("done", OUT);
