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
  const useAgent = config.get<boolean>("useAgentApi") ?? false;

  const question = buildPrompt(intent, code, languageId);

  if (useAgent) {
    return requestAgent(baseUrl, question);
  }

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

async function requestAgent(baseUrl: string, message: string) {
  const response = await fetch(`${baseUrl}/api/agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Agent API ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf("\n\n");

    while (boundary !== -1) {
      const block = buffer.slice(0, boundary).trim();
      buffer = buffer.slice(boundary + 2);

      const dataLine = block
        .split("\n")
        .find((line) => line.startsWith("data:"))
        ?.slice(5)
        .trim();

      if (dataLine) {
        try {
          const payload = JSON.parse(dataLine) as { type?: string; text?: string };
          if (payload.type === "answer" && payload.text) {
            answer = payload.text;
          }
        } catch {
          // ignore partial JSON
        }
      }

      boundary = buffer.indexOf("\n\n");
    }
  }

  return answer || "Agent 未返回最终回答";
}
