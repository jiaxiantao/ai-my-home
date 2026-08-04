import { KnowledgeStudioExternalRedirect } from "@/components/knowledge-studio-external-redirect";

export const dynamic = "force-static";

export default function AssistantRedirect() {
  return (
    <KnowledgeStudioExternalRedirect
      path="assistant"
      label="正在跳转到 Knowledge Studio Assistant…"
    />
  );
}
