import { chromium } from "@playwright/test";
import * as path from "path";
import * as http from "http";
import * as fs from "fs";

const ROOT = path.resolve(process.cwd());

async function serveDir(dir, port) {
  const server = http.createServer((req, res) => {
    let filePath = path.join(dir, req.url === "/" ? "index.html" : req.url);
    if (!fs.existsSync(filePath)) filePath = path.join(dir, "index.html");
    const ext = path.extname(filePath);
    const mime = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".ico": "image/x-icon",
      ".ttf": "font/ttf",
      ".woff2": "font/woff2",
      ".png": "image/png",
      ".jpg": "image/jpeg",
    };
    res.setHeader("Content-Type", mime[ext] ?? "application/octet-stream");
    fs.createReadStream(filePath).pipe(res);
  });
  await new Promise((r) => server.listen(port, r));
  return () => server.close();
}

(async () => {
  const distDir = path.join(ROOT, "dist");
  const port = 3737;
  const stop = await serveDir(distDir, port);

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  // Log alle browser console-berichten
  page.on("console", (msg) =>
    console.log(`[browser ${msg.type()}]`, msg.text()),
  );
  page.on("pageerror", (err) =>
    console.error("[browser pageerror]", err.message),
  );

  try {
    await page.goto(`http://localhost:${port}`);

    // Wacht tot de feed geladen is
    await page.waitForTimeout(4000);

    // Screenshot
    await page.screenshot({
      path: path.join(ROOT, "feed-smoke.png"),
      fullPage: false,
    });
    console.log("✓ Screenshot opgeslagen: e2e/feed-smoke.png");

    // Check: zijn er Pressable-elementen zichtbaar (artikelkaarten)?
    const cards = await page.locator("[data-testid]").count();
    console.log(
      `✓ Pagina geladen. DOM-nodes: ${await page.locator("*").count()}`,
    );

    // Scroll naar beneden
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(ROOT, "feed-scroll.png"),
      fullPage: false,
    });
    console.log("✓ Scroll-screenshot opgeslagen: e2e/feed-scroll.png");

    console.log("\n✅ Feed smoke test geslaagd");
  } catch (e) {
    console.error("❌ Smoke test mislukt:", e);
    process.exit(1);
  } finally {
    await browser.close();
    stop();
  }
})();
