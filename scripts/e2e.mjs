// End-to-end checks + screenshots for ClearDoor.
// Run after `npm run build`:  node scripts/e2e.mjs
// Fails (exit 1) if any check fails or the page logs a console error.
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const CHROME =
  "/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome";
const ROOT = new URL("..", import.meta.url).pathname;
const DIST = join(ROOT, "dist");
const DOCS = join(ROOT, "docs");
await mkdir(DOCS, { recursive: true });

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".png": "image/png",
};

const server = createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (path === "/") path = "/index.html";
  try {
    const body = await readFile(join(DIST, normalize(path)));
    res.writeHead(200, {
      "Content-Type": MIME[extname(path)] || "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push(String(err)));

let passed = 0;
function check(name, ok) {
  if (!ok) throw new Error(`CHECK FAILED: ${name}`);
  passed += 1;
  console.log(`ok - ${name}`);
}

await page.goto(base, { waitUntil: "networkidle" });
check("app title shows ClearDoor", (await page.title()).includes("ClearDoor"));
check(
  "make screen heading visible",
  await page.locator("text=1. Paste the hard lesson").isVisible(),
);
check(
  "sample lesson preloaded in textarea",
  (await page.locator("#lesson-text").inputValue()).includes("Photosynthesis"),
);
check(
  "live reading level chip visible",
  await page.locator("text=Reading level: grade").first().isVisible(),
);
await page.screenshot({ path: join(DOCS, "1-make.png") });

await page
  .locator("main")
  .getByRole("button", { name: "Make it clear" })
  .click();
await page.waitForSelector(".result-text");
check("clear version appears", await page.locator(".result-text").isVisible());
check(
  "before and after boxes shown",
  (await page.locator(".compare-box").count()) === 2,
);
const resultText = await page.locator(".result-text").innerText();
check("simplified text uses plain word use", /\buse\b/i.test(resultText));
await page.screenshot({ path: join(DOCS, "2-result.png") });

await page.getByRole("button", { name: "Save to library" }).click();
check(
  "saved notice shows",
  await page.locator("text=Saved to your offline library.").isVisible(),
);

await page.getByRole("button", { name: "Read" }).click();
check(
  "reader shows a lesson title",
  await page.locator(".reading-page h2").isVisible(),
);
await page.locator("#font-size").fill("26");
check(
  "font size control updates",
  (await page.locator(".reading-page").evaluate((el) => el.style.fontSize)) ===
    "26px",
);
await page.getByRole("button", { name: "Night" }).click();
check(
  "night theme applies",
  await page.locator(".reading-page.theme-night").isVisible(),
);
await page.screenshot({ path: join(DOCS, "3-read-night.png") });
await page.getByRole("button", { name: "Paper" }).click();
await page.locator(".reading-page .para").first().click();
check(
  "focus mode dims other paragraphs",
  (await page.locator(".reading-page .para.dim").count()) > 0,
);
await page.screenshot({ path: join(DOCS, "4-read-focus.png") });

await page.getByRole("button", { name: "My library" }).click();
check(
  "library shows saved lesson cards",
  (await page.locator(".card").count()) >= 2,
);
await page.locator(".search").fill("Photosynthesis");
await page.waitForTimeout(300);
check(
  "search filters cards",
  (await page.locator(".card").count()) >= 1,
);
await page.screenshot({ path: join(DOCS, "5-library.png") });

await page.setViewportSize({ width: 390, height: 844 });
await page
  .getByRole("navigation", { name: "Main" })
  .getByRole("button", { name: "Make it clear" })
  .click();
await page.screenshot({ path: join(DOCS, "6-mobile.png") });
check("mobile layout renders", await page.locator(".topbar").isVisible());

if (errors.length) console.error("CONSOLE ERRORS:", errors);
check("zero console errors", errors.length === 0);

await browser.close();
server.close();
console.log(`\nE2E: ${passed} checks passed, ${errors.length} console errors`);
