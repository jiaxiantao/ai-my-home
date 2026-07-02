import type { Metadata } from "next";

import { ResumePrintDocument } from "@/components/resume-print-document";

export const metadata: Metadata = {
  title: "贾先涛 · 简历（打印版）",
  robots: { index: false, follow: false },
};

export default function ResumePrintPage() {
  return <ResumePrintDocument />;
}
