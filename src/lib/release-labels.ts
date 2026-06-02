import type { ReleaseOrderStatus } from "@/lib/release-center-types";

export const RELEASE_ORDER_STATUS_LABELS: Record<ReleaseOrderStatus, string> = {
  draft: "草稿",
  built: "已构建",
  testing: "测试中",
  staging: "预发",
  released: "已上线",
};

export function formatReleaseOrderStatus(status: ReleaseOrderStatus) {
  return RELEASE_ORDER_STATUS_LABELS[status];
}
