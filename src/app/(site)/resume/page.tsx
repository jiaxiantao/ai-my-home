import { StaticExportRedirect } from "@/components/static-export-redirect";

export const dynamic = "force-static";

const resumeHref =
  process.env.NEXT_PUBLIC_BASE_PATH && process.env.NEXT_PUBLIC_BASE_PATH.length > 0
    ? `${process.env.NEXT_PUBLIC_BASE_PATH}/#resume`
    : "/#resume";

export default function ResumeRedirect() {
  return <StaticExportRedirect href={resumeHref} label="正在跳转到简历…" />;
}
