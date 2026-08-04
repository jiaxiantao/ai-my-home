import { KnowledgeStudioExternalRedirect } from "@/components/knowledge-studio-external-redirect";

export const dynamic = "force-static";

export default function NotesRedirect() {
  return (
    <KnowledgeStudioExternalRedirect
      path="notes"
      label="正在跳转到 Knowledge Studio 笔记库…"
    />
  );
}
