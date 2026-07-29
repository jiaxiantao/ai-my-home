"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

import {
  applySamePageHashNavigation,
  parseHashHref,
} from "@/lib/smooth-hash";

type HashLinkProps = Omit<ComponentProps<typeof Link>, "scroll"> & {
  href: string;
};

export function HashLink({ href, onClick, ...props }: HashLinkProps) {
  const pathname = usePathname();
  const { hash } = parseHashHref(href);

  return (
    <Link
      {...props}
      href={href}
      scroll={!hash}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        if (applySamePageHashNavigation(href, pathname)) {
          event.preventDefault();
        }
        onClick?.(event);
      }}
    />
  );
}
