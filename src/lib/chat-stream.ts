export type ChatReference = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  tags: string[];
};

type StreamHandlers = {
  onReferences?: (references: ChatReference[]) => void;
  onChunk?: (text: string) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
};

function parseSseBlock(block: string, handlers: StreamHandlers) {
  const lines = block.split("\n");
  let eventName = "message";
  let dataLine = "";

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLine += line.slice(5).trim();
    }
  }

  if (!dataLine) {
    return;
  }

  const payload = JSON.parse(dataLine) as Record<string, unknown>;

  if (eventName === "references") {
    handlers.onReferences?.(payload.references as ChatReference[]);
    return;
  }

  if (eventName === "chunk") {
    handlers.onChunk?.(String(payload.text ?? ""));
    return;
  }

  if (eventName === "error") {
    handlers.onError?.(String(payload.message ?? "Stream failed"));
    return;
  }

  if (eventName === "done") {
    handlers.onDone?.();
  }
}

export async function streamChatQuestion(
  question: string,
  handlers: StreamHandlers,
) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, stream: true }),
  });

  if (!response.ok) {
    let message = "问答失败";

    try {
      const payload = (await response.json()) as { error?: string };
      message = payload.error ?? message;
    } catch {
      // ignore
    }

    handlers.onError?.(message);
    return;
  }

  const reader = response.body?.getReader();

  if (!reader) {
    handlers.onError?.("浏览器不支持流式读取");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf("\n\n");

    while (boundary !== -1) {
      const block = buffer.slice(0, boundary).trim();
      buffer = buffer.slice(boundary + 2);

      if (block) {
        parseSseBlock(block, handlers);
      }

      boundary = buffer.indexOf("\n\n");
    }
  }

  const tail = buffer.trim();
  if (tail) {
    parseSseBlock(tail, handlers);
  }

  handlers.onDone?.();
}
