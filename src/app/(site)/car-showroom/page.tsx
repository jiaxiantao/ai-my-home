import { redirect } from "next/navigation";

import { EXTERNAL_PROJECTS } from "@/lib/external-projects";

export default function CarShowroomRedirect() {
  redirect(EXTERNAL_PROJECTS.carShowroom.previewUrl);
}
