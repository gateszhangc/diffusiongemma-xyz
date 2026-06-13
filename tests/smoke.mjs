import { chromium } from "playwright";

const url = process.env.SITE_URL || "http://127.0.0.1:8765";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(url, { waitUntil: "networkidle" });

const title = await page.title();
if (!title.includes("DiffusionGemma")) {
  throw new Error(`Unexpected title: ${title}`);
}

const body = await page.locator("body").innerText();
for (const expected of [
  "experimental text diffusion model",
  "Gemma 4",
  "256-token canvas",
  "vLLM",
  "OpenAI-compatible chat endpoint",
]) {
  if (!body.includes(expected)) throw new Error(`Missing expected text: ${expected}`);
}

for (const stale of [
  "mirofish",
  "Gemma 2",
  "May 2025",
  "DiffusionPipeline",
  "generating images",
]) {
  if (body.includes(stale)) throw new Error(`Found stale text: ${stale}`);
}

const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
if (canonical !== "https://diffusiongemma.xyz/") {
  throw new Error(`Unexpected canonical URL: ${canonical}`);
}

const guideLinks = await page.locator('a[href="https://developers.googleblog.com/diffusiongemma-the-developer-guide/"]').count();
const modelLinks = await page.locator('a[href="https://huggingface.co/google/diffusiongemma-26B-A4B-it"]').count();
if (guideLinks < 2 || modelLinks < 2) {
  throw new Error(`Expected official links, got guide=${guideLinks}, model=${modelLinks}`);
}

if (errors.length) {
  throw new Error(`Browser console errors:\n${errors.join("\n")}`);
}

await browser.close();
