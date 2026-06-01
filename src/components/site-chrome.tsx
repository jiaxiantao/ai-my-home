"use client";

import { CommandPalette } from "@/components/command-palette";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CommandPalette />
    </>
  );
}
