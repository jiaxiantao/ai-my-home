"use client";

import { CommandPalette } from "@/components/command-palette";
import { HomeScrollRestoreListener } from "@/components/home-scroll-restoration";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HomeScrollRestoreListener />
      {children}
      <CommandPalette />
    </>
  );
}
