import { spawn } from "node:child_process";
import { mkdir, access } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const defaultPlaywrightBrowsersPath = path.join(
  os.homedir(),
  "Library/Caches/ms-playwright",
);
process.env.PLAYWRIGHT_BROWSERS_PATH ??= defaultPlaywrightBrowsersPath;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "output");
const outputFile = path.join(outputDir, "贾先涛-高级前端研发工程师-简历.pdf");
const baseURL = process.env.RESUME_PDF_BASE_URL ?? "http://127.0.0.1:3000";
const printURL = `${baseURL}/resume/print`;

function waitForServer(url, timeoutMs = 120_000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(3_000) });
        if (response.ok) {
          resolve();
          return;
        }
      } catch {
        // retry
      }

      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }

      setTimeout(tick, 500);
    };

    tick();
  });
}

async function isServerUp(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function startDevServer() {
  const child = spawn("pnpm", ["dev", "--port", "3000"], {
    cwd: rootDir,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, FORCE_COLOR: "0" },
  });

  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));

  await waitForServer(`${baseURL}/api/health`);

  return async () => {
    child.kill("SIGTERM");
    await new Promise((resolve) => {
      child.once("exit", resolve);
      setTimeout(resolve, 2_000);
    });
  };
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  let stopServer = async () => {};
  const healthURL = `${baseURL}/api/health`;

  if (!(await isServerUp(healthURL))) {
    console.log("Starting dev server for PDF generation...");
    stopServer = await startDevServer();
  } else {
    console.log("Reusing existing dev server.");
  }

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.goto(printURL, { waitUntil: "load", timeout: 60_000 });
    await page.waitForSelector(".resume-print", { timeout: 30_000 });
    await page.emulateMedia({ media: "print" });
    await page.pdf({
      path: outputFile,
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", right: "10mm", bottom: "12mm", left: "10mm" },
    });
    await access(outputFile);
    console.log(`\nResume PDF generated: ${outputFile}`);
  } finally {
    await browser.close();
    await stopServer();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
