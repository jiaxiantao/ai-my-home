import type { NextConfig } from "next";

const isGhPages = process.env.GH_PAGES === "1";
/** Custom domain serves at site root; set GH_PAGES_BASE_PATH=/ai-my-home only for path-based github.io deploys. */
const ghPagesBasePath = (process.env.GH_PAGES_BASE_PATH ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: isGhPages ? "export" : "standalone",
  basePath: isGhPages && ghPagesBasePath ? ghPagesBasePath : undefined,
  assetPrefix: isGhPages && ghPagesBasePath ? ghPagesBasePath : undefined,
  trailingSlash: isGhPages ? true : undefined,
  images: {
    unoptimized: isGhPages,
  },
  ...(isGhPages
    ? {
        env: {
          NEXT_PUBLIC_BASE_PATH: ghPagesBasePath,
        },
        turbopack: {},
      }
    : {
        outputFileTracingIncludes: {
          "/*": [
            "./node_modules/.prisma/client/**/*",
            "./node_modules/@prisma/client/**/*",
          ],
        },
        turbopack: {},
      }),
  ...(!isGhPages
    ? {
        async headers() {
          return [
            {
              source: "/models/:path*",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
