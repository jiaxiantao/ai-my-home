/**
 * Path-based reverse proxy for www.jiaxiantao.xyz → GitHub Pages project sites.
 *
 * Examples:
 *   /                 → jiaxiantao.github.io/ai-my-home/
 *   /ai-my-home/...   → jiaxiantao.github.io/ai-my-home/...
 *   /cos-design/...   → jiaxiantao.github.io/cos-design/...
 *   /next-static/...  → jiaxiantao.github.io/ai-my-home/next-static/...
 *     (compat for stale HTML from a brief root deploy without basePath)
 *
 * Deploy: Cloudflare Dashboard → Workers & Pages → Create Worker,
 * paste this file, then add route www.jiaxiantao.xyz/* (and apex if needed)
 *
 * See docs/cloudflare-path-router.md
 */

const GITHUB_PAGES_ORIGIN = "https://jiaxiantao.github.io";
const DEFAULT_PROJECT = "/ai-my-home";

/** Longest-prefix match; order does not matter because we pick the longest. */
const PROJECT_PREFIXES = [
  "/ai-my-home",
  "/cos-design",
  "/team-docs",
  "/3d-car-viewing",
  "/home-agent",
  "/3d-express-warehouse",
  "/blogs",
];

/**
 * Root-level asset prefixes that belong to the default portfolio site.
 * Needed when browsers still hold HTML from a deploy without basePath
 * (links like /next-static/... and /resume/... at the domain root).
 */
const DEFAULT_SITE_ASSET_PREFIXES = [
  "/next-static/",
  "/_next/",
  "/resume/",
  "/models/",
  "/workers/",
];

/** Root-level browser/SEO/public files that belong to the default site. */
const DEFAULT_SITE_ROOT_PATHS = new Set([
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
  "/site.webmanifest",
  "/file.svg",
  "/globe.svg",
  "/next.svg",
  "/vercel.svg",
  "/window.svg",
]);

function resolveUpstreamPath(pathname) {
  if (pathname === "/" || pathname === "") {
    return `${DEFAULT_PROJECT}/`;
  }

  if (
    DEFAULT_SITE_ROOT_PATHS.has(pathname) ||
    pathname.startsWith("/.well-known/")
  ) {
    return `${DEFAULT_PROJECT}${pathname}`;
  }

  for (const prefix of DEFAULT_SITE_ASSET_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return `${DEFAULT_PROJECT}${pathname}`;
    }
  }

  const sorted = [...PROJECT_PREFIXES].sort((a, b) => b.length - a.length);
  for (const prefix of sorted) {
    if (pathname === prefix) {
      return `${prefix}/`;
    }
    if (pathname.startsWith(`${prefix}/`)) {
      return pathname;
    }
  }

  return null;
}

function buildUpstreamHeaders(request) {
  const headers = new Headers(request.headers);
  headers.delete("host");
  // Fetch uncompressed so we can safely rewrite headers; CF recompresses to client.
  headers.set("accept-encoding", "identity");
  return headers;
}

function buildClientHeaders(upstreamResponse, requestUrl) {
  const responseHeaders = new Headers(upstreamResponse.headers);

  // Body is identity from upstream; drop encoding metadata so CF can negotiate cleanly.
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  const location = responseHeaders.get("location");
  if (location) {
    try {
      const loc = new URL(location, GITHUB_PAGES_ORIGIN);
      if (loc.hostname === "jiaxiantao.github.io") {
        loc.protocol = requestUrl.protocol;
        loc.host = requestUrl.host;
        responseHeaders.set("location", loc.toString());
      }
    } catch {
      // keep original location
    }
  }

  const contentType = responseHeaders.get("content-type") || "";
  if (contentType.includes("text/html")) {
    // Avoid sticky stale HTML after basePath / routing changes.
    responseHeaders.set(
      "cache-control",
      "public, max-age=0, must-revalidate",
    );
  }

  responseHeaders.set("x-proxied-by", "jiaxiantao-xyz-router");
  return responseHeaders;
}

const worker = {
  async fetch(request) {
    const url = new URL(request.url);
    const upstreamPath = resolveUpstreamPath(url.pathname);

    if (!upstreamPath) {
      return new Response("Not Found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    const upstreamUrl = new URL(
      `${upstreamPath}${url.search}`,
      GITHUB_PAGES_ORIGIN,
    );

    const upstreamRequest = new Request(upstreamUrl.toString(), {
      method: request.method,
      headers: buildUpstreamHeaders(request),
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : request.body,
      redirect: "manual",
    });

    const upstreamResponse = await fetch(upstreamRequest);
    const responseHeaders = buildClientHeaders(upstreamResponse, url);
    responseHeaders.set("x-upstream-url", upstreamUrl.toString());

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  },
};

export default worker;
