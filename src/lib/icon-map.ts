import type { LucideIcon } from "lucide-react";
import {
  Database,
  Gauge,
  LayoutGrid,
  Smartphone,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";

export type IconKey =
  | "layout-grid"
  | "workflow"
  | "gauge"
  | "database"
  | "sparkles"
  | "users"
  | "smartphone";

export const iconMap: Record<IconKey, LucideIcon> = {
  "layout-grid": LayoutGrid,
  workflow: Workflow,
  gauge: Gauge,
  database: Database,
  sparkles: Sparkles,
  users: Users,
  smartphone: Smartphone,
};
