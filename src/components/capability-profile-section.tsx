import { CapabilityProfileInteractive } from "@/components/capability-profile-interactive";
import type { DashboardData } from "@/lib/dashboard-service";

export function CapabilityProfileSection({
  dashboard,
}: {
  dashboard: DashboardData;
}) {
  return <CapabilityProfileInteractive dashboard={dashboard} />;
}
