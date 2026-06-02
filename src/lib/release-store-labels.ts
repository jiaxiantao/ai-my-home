import type { ReleaseStoreMode } from "@/lib/release-service";

export function formatReleaseStoreMode(mode: ReleaseStoreMode) {
  switch (mode) {
    case "postgresql":
      return "PostgreSQL";
    case "memory":
      return "内存演示";
    case "unavailable":
      return "不可用";
    default:
      return mode;
  }
}
