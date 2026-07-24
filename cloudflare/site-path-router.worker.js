/**
 * Path-based reverse proxy for jiaxiantao.xyz → GitHub Pages project sites.
 *
 * Canonical host is the apex domain (no www). www redirects here so browser
 * and CDN caches do not split across two hostnames.
 *
 * Examples:
 *   www.jiaxiantao.xyz/*  → 301 jiaxiantao.xyz/* (same path)
 *   /                     → 302 /ai-my-home/  (required for Next basePath hydration)
 *   /ai-my-home/...       → jiaxiantao.github.io/ai-my-home/...
 *   /cos-design/...       → jiaxiantao.github.io/cos-design/...
 *   /next-static/...      → jiaxiantao.github.io/ai-my-home/next-static/...
 *
 * Deploy: Cloudflare Dashboard → Workers & Pages → edit Worker,
 * paste this file, ensure routes: jiaxiantao.xyz/* and www.jiaxiantao.xyz/*
 *
 * See docs/cloudflare-path-router.md
 */

const GITHUB_PAGES_ORIGIN = "https://jiaxiantao.github.io";
const CANONICAL_HOST = "jiaxiantao.xyz";
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
  // Fetch uncompressed so we can set accurate Content-Length.
  headers.set("accept-encoding", "identity");
  return headers;
}

function buildClientHeaders(upstreamResponse, requestUrl, { isHtml, isEmpty }) {
  const responseHeaders = new Headers(upstreamResponse.headers);

  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  const location = responseHeaders.get("location");
  if (location) {
    try {
      const loc = new URL(location, GITHUB_PAGES_ORIGIN);
      if (loc.hostname === "jiaxiantao.github.io") {
        loc.protocol = requestUrl.protocol;
        loc.host = CANONICAL_HOST;
        responseHeaders.set("location", loc.toString());
      }
    } catch {
      // keep original location
    }
  }

  if (isHtml) {
    responseHeaders.set(
      "cache-control",
      "public, max-age=0, must-revalidate, no-transform",
    );
  } else if (isEmpty) {
    // Never let CDN keep an empty CSS/JS/image body.
    responseHeaders.set("cache-control", "no-store, no-transform");
  } else {
    const cacheControl = responseHeaders.get("cache-control");
    if (cacheControl) {
      if (!/\bno-transform\b/i.test(cacheControl)) {
        responseHeaders.set("cache-control", `${cacheControl}, no-transform`);
      }
    } else {
      responseHeaders.set(
        "cache-control",
        "public, max-age=14400, no-transform",
      );
    }
  }

  responseHeaders.set("x-proxied-by", "jiaxiantao-xyz-router");
  return responseHeaders;
}

function redirectToPath(url, pathname) {
  const target = new URL(pathname, `https://${CANONICAL_HOST}`);
  target.search = url.search;
  return Response.redirect(target.toString(), 302);
}

function redirectToCanonicalHost(url) {
  const target = new URL(url.toString());
  target.protocol = "https:";
  target.hostname = CANONICAL_HOST;
  return Response.redirect(target.toString(), 301);
}

const worker = {
  async fetch(request) {
    const url = new URL(request.url);

    // One hostname only — avoids www vs apex split caches (www looked unstyled).
    if (url.hostname === `www.${CANONICAL_HOST}`) {
      return redirectToCanonicalHost(url);
    }

    // basePath=/ai-my-home — HTML must be served under that path.
    if (url.pathname === "/" || url.pathname === "") {
      return redirectToPath(url, `${DEFAULT_PROJECT}/`);
    }

    if (url.pathname === DEFAULT_PROJECT) {
      return redirectToPath(url, `${DEFAULT_PROJECT}/`);
    }

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
    const contentType = upstreamResponse.headers.get("content-type") || "";
    const isHtml = contentType.includes("text/html");

    if (request.method === "HEAD") {
      const responseHeaders = buildClientHeaders(upstreamResponse, url, {
        isHtml,
        isEmpty: false,
      });
      responseHeaders.set("x-upstream-url", upstreamUrl.toString());
      return new Response(null, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
      });
    }

    const body = await upstreamResponse.arrayBuffer();
    const isEmpty = body.byteLength === 0 && upstreamResponse.status === 200;
    const responseHeaders = buildClientHeaders(upstreamResponse, url, {
      isHtml,
      isEmpty,
    });
    responseHeaders.set("content-length", String(body.byteLength));
    responseHeaders.set("x-upstream-url", upstreamUrl.toString());

    if (isEmpty && !isHtml) {
      return new Response("Bad Gateway: empty upstream asset", {
        status: 502,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store",
          "x-proxied-by": "jiaxiantao-xyz-router",
          "x-upstream-url": upstreamUrl.toString(),
        },
      });
    }

    return new Response(body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  },
};

export default worker;
