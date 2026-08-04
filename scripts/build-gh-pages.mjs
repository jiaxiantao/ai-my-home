import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const apiDir = path.join(root, "src/app/api");
const stashDir = path.join(root, "scripts/.gh-pages-stash/api");
const stashRoot = path.join(root, "scripts/.gh-pages-stash");

const dynamicRouteDirs = [];

const dynamicOgImages = [
  "src/app/(site)/cases/[slug]/opengraph-image.tsx",
  "src/app/(site)/insights/[slug]/opengraph-image.tsx",
];

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://jiaxiantao.xyz/ai-my-home";

function stashApiRoutes() {
  if (!fs.existsSync(apiDir)) {
    return;
  }

  fs.mkdirSync(path.dirname(stashDir), { recursive: true });

  if (fs.existsSync(stashDir)) {
    fs.rmSync(stashDir, { recursive: true, force: true });
  }

  fs.renameSync(apiDir, stashDir);
  console.log("[gh-pages] stashed src/app/api for static export");
}

function stashDynamicRouteDirs() {
  for (const relativePath of dynamicRouteDirs) {
    const absolutePath = path.join(root, relativePath);
    if (!fs.existsSync(absolutePath)) {
      continue;
    }

    const targetPath = path.join(stashRoot, relativePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    }
    fs.renameSync(absolutePath, targetPath);
    console.log(`[gh-pages] stashed ${relativePath}`);
  }
}

function stashDynamicOgImages() {
  for (const relativePath of dynamicOgImages) {
    const absolutePath = path.join(root, relativePath);
    if (!fs.existsSync(absolutePath)) {
      continue;
    }

    const targetPath = path.join(stashRoot, relativePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.renameSync(absolutePath, targetPath);
    console.log(`[gh-pages] stashed ${relativePath}`);
  }
}

function restoreStashedPaths() {
  if (fs.existsSync(stashRoot)) {
    for (const relativePath of dynamicRouteDirs) {
      const absolutePath = path.join(root, relativePath);
      const targetPath = path.join(stashRoot, relativePath);
      if (!fs.existsSync(targetPath)) {
        continue;
      }

      fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
      if (fs.existsSync(absolutePath)) {
        fs.rmSync(absolutePath, { recursive: true, force: true });
      }
      fs.renameSync(targetPath, absolutePath);
      console.log(`[gh-pages] restored ${relativePath}`);
    }

    for (const relativePath of dynamicOgImages) {
      const absolutePath = path.join(root, relativePath);
      const targetPath = path.join(stashRoot, relativePath);
      if (!fs.existsSync(targetPath)) {
        continue;
      }

      fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
      if (fs.existsSync(absolutePath)) {
        fs.rmSync(absolutePath, { force: true });
      }
      fs.renameSync(targetPath, absolutePath);
      console.log(`[gh-pages] restored ${relativePath}`);
    }
  }

  restoreApiRoutes();
}

function restoreApiRoutes() {
  if (!fs.existsSync(stashDir)) {
    return;
  }

  if (fs.existsSync(apiDir)) {
    fs.rmSync(apiDir, { recursive: true, force: true });
  }

  fs.renameSync(stashDir, apiDir);
  console.log("[gh-pages] restored src/app/api");
}

function run(command) {
  execSync(command, {
    stdio: "inherit",
    env: {
      ...process.env,
      GH_PAGES: "1",
      NEXT_PUBLIC_SITE_URL: siteUrl,
      DATABASE_URL: "",
      NODE_OPTIONS: process.env.NODE_OPTIONS ?? "--max-old-space-size=6144",
    },
  });
}

try {
  stashApiRoutes();
  stashDynamicRouteDirs();
  stashDynamicOgImages();
  run("pnpm exec prisma generate");
  run("pnpm exec next build --webpack");
  run("node scripts/prepare-gh-pages-export.mjs");
} finally {
  restoreStashedPaths();
}
