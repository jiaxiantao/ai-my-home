/**
 * Path-based reverse proxy for www.jiaxiantao.xyz → GitHub Pages project sites.
 *
 * Examples:
 *   /                 → jiaxiantao.github.io/ai-my-home/
 *   /ai-my-home/...   → jiaxiantao.github.io/ai-my-home/...
 *   /cos-design/...   → jiaxiantao.github.io/cos-design/...
 *
 * Deploy: Cloudflare Dashboard → Workers & Pages → Create Worker,
 * paste this file, then add route www.jiaxiantao.xyz/*
 *
 * See docs/cloudflare-path-router.md
 */

const GITHUB_PAGES_ORIGIN = "https://jiaxiantao.github.io";

/** Longest-prefix match; order does not matter because we pick the longest. */
const PROJECT_PREFIXES = [
  "/ai-my-home",
  "/cos-design",
  "/team-docs",
  "/3d-car-viewing",
  "/home-agent",
  "/3d-express-warehouse",
];

function resolveUpstreamPath(pathname) {
  if (pathname === "/" || pathname === "") {
    return "/ai-my-home/";
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
  headers.set("accept-encoding", "identity");
  return headers;
}

export default {
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
    const responseHeaders = new Headers(upstreamResponse.headers);

    // Avoid leaking GitHub Pages host redirects that break the custom domain.
    const location = responseHeaders.get("location");
    if (location) {
      try {
        const loc = new URL(location, upstreamUrl);
        if (loc.hostname === "jiaxiantao.github.io") {
          loc.protocol = url.protocol;
          loc.host = url.host;
          responseHeaders.set("location", loc.toString());
        }
      } catch {
        // keep original location
      }
    }

    responseHeaders.set("x-proxied-by", "jiaxiantao-xyz-router");
    responseHeaders.set("x-upstream-url", upstreamUrl.toString());

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  },
};
