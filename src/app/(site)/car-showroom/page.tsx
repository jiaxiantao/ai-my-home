import { StaticExportRedirect } from "@/components/static-export-redirect";
import { EXTERNAL_PROJECTS } from "@/lib/external-projects";

export const dynamic = "force-static";

export default function CarShowroomRedirect() {
  return (
    <StaticExportRedirect
      href={EXTERNAL_PROJECTS.carShowroom.previewUrl}
      label="正在跳转到 3D 看车演示…"
    />
  );
}
