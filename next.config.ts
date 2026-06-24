import type { NextConfig } from "next";

const isGhPages = process.env.GH_PAGES === "1";
const ghPagesBasePath = "/ai-my-home";

const nextConfig: NextConfig = {
  output: isGhPages ? "export" : "standalone",
  basePath: isGhPages ? ghPagesBasePath : undefined,
  assetPrefix: isGhPages ? ghPagesBasePath : undefined,
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
