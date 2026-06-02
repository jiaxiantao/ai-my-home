# AI My Home · VS Code 插件（演示）

智能 IDE 插件雏形：通过本站 `/api/chat` 或 `/api/agent` 为选中代码提供**解释、补全、重构**。

## 架构

```text
VS Code Command
    → aiClient.ts (HTTP)
    → ai-my-home /api/chat | /api/agent
    → Ollama / Mock

扩展路线（LSP）：
    Language Client (本插件)
    → Language Server (node)
    → textDocument/* + AI 补全 Provider
```

与 **Language Server Protocol** 的结合方式：

| 能力 | LSP 方法 | 本演示 |
|------|----------|--------|
| 补全 | `textDocument/completion` | Command + Chat API |
| 悬停解释 | `textDocument/hover` | Explain command |
| 重构 | `textDocument/codeAction` | Refactor command |

生产环境应在 Language Server 内调用 AI，并做增量上下文、token 预算与缓存。

## 开发

```bash
cd extensions/vscode-ai-assistant
pnpm install   # 或 npm install
pnpm compile
```

在 VS Code 中 **F5** 启动 Extension Development Host。

## 配置

- `aiMyHome.apiBaseUrl` — 默认 `http://localhost:3000`
- `aiMyHome.useAgentApi` — `true` 时走 `/api/agent` 多步工具链

需本机 `pnpm dev` 且数据库/Ollama 或 `LLM_DISABLED=1` mock 可用。
