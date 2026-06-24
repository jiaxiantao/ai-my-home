import { redirect } from "next/navigation";

import { buildExternalAgentUrl } from "@/lib/external-projects";

type AgentsRedirectProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AgentsRedirect({ searchParams }: AgentsRedirectProps) {
  const { q } = await searchParams;
  redirect(buildExternalAgentUrl(q));
}
