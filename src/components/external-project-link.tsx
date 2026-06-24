import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

type ExternalProjectLinkProps = {
  href: string;
  label: string;
  className?: string;
};

export function ExternalProjectLink({
  href,
  label,
  className,
}: ExternalProjectLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 transition hover:text-white",
        className,
      )}
    >
      {label}
      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-70" />
    </a>
  );
}
