import * as vscode from "vscode";

export type AiIntent = "explain" | "complete" | "refactor";

function buildPrompt(intent: AiIntent, code: string, languageId: string) {
  const headers: Record<AiIntent, string> = {
    explain: "请用简洁中文解释以下代码片段的作用与注意点：",
    complete: "请补全以下代码，只输出代码、不要 markdown 围栏：",
    refactor: "请给出重构建议并附上改进后的代码：",
  };

  return `${headers[intent]}\n\n语言: ${languageId}\n\n\`\`\`\n${code}\n\`\`\``;
}

export async function requestAiAssist(
  intent: AiIntent,
  code: string,
  languageId: string,
): Promise<string> {
  const config = vscode.workspace.getConfiguration("aiMyHome");
  const baseUrl = (config.get<string>("apiBaseUrl") ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );

  const question = buildPrompt(intent, code, languageId);

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, stream: false }),
  });

  if (!response.ok) {
    throw new Error(`Chat API ${response.status}`);
  }

  const data = (await response.json()) as { answer?: string };
  return data.answer ?? "无回答";
}
