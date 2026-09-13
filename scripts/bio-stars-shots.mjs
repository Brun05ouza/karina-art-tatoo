import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const out = "tmp/bio-stars-a";
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const sizes = [
  [1440, 900, "d1440"],
  [768, 1024, "t768"],
  [390, 844, "m390"],
];

for (const [width, height, name] of sizes) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto("http://localhost:5174/bio", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    document.querySelectorAll(".ks-preloader, [class*=preloader]").forEach((el) => el.remove());
  });
  await page.waitForTimeout(300);

  await page.screenshot({ path: `${out}/${name}-clean-top.png` });

  const chips = page.locator(".bio-style-tags");
  if ((await chips.count()) > 0) {
    await chips.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${out}/${name}-clean-chips.png` });
    const chip = page.locator(".bio-style-tags__chip").first();
    const box = await chip.boundingBox();
    if (box) {
      const hit = await page.evaluate(
        ({ x, y }) => {
          const el = document.elementFromPoint(x, y);
          return el ? { tag: el.tagName, cls: String(el.className || "").slice(0, 80) } : null;
        },
        { x: box.x + box.width / 2, y: box.y + box.height / 2 },
      );
      console.log(name, "chip hit:", hit);
    }
  }

  const studio = page.locator(".ks-bio-studio");
  if ((await studio.count()) > 0) {
    await studio.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${out}/${name}-clean-studio.png` });
    const cta = page.locator(".ks-bio-studio .ks-bio-block__cta").first();
    const box = await cta.boundingBox();
    if (box) {
      const hit = await page.evaluate(
        ({ x, y }) => {
          const el = document.elementFromPoint(x, y);
          return el ? { tag: el.tagName, cls: String(el.className || "").slice(0, 80) } : null;
        },
        { x: box.x + box.width / 2, y: box.y + box.height / 2 },
      );
      console.log(name, "studio cta hit:", hit);
    }
  }
  await page.close();
}

await browser.close();
console.log("done", out);
