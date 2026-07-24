/** Canonical public site URL (may include basePath, e.g. …/ai-my-home). */
export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/**
 * Origin only for Next.js `metadataBase`.
 * With `basePath` set, Next already prefixes asset routes; putting the path in
 * metadataBase would produce `/ai-my-home/ai-my-home/opengraph-image`.
 */
export function getMetadataBaseUrl() {
  return new URL(getSiteUrl()).origin;
}
