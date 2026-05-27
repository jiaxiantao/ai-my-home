"use client";

export function DashboardPanelMount({
  id,
  active,
  children,
}: {
  id: string;
  active: string;
  children: React.ReactNode;
}) {
  if (id !== active) {
    return null;
  }

  return children;
}
