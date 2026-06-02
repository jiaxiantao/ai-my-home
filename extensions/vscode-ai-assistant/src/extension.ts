import * as vscode from "vscode";

import { requestAiAssist } from "./aiClient";

async function withSelection(
  intent: Parameters<typeof requestAiAssist>[0],
  editor: vscode.TextEditor,
) {
  const selection = editor.document.getText(editor.selection);

  if (!selection.trim()) {
    void vscode.window.showWarningMessage("请先选中一段代码");
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `AI My Home · ${intent}`,
    },
    async () => {
      try {
        const answer = await requestAiAssist(
          intent,
          selection,
          editor.document.languageId,
        );

        const doc = await vscode.workspace.openTextDocument({
          content: answer,
          language: "markdown",
        });

        await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
      } catch (error) {
        const message = error instanceof Error ? error.message : "请求失败";
        void vscode.window.showErrorMessage(message);
      }
    },
  );
}

export function activate(context: vscode.ExtensionContext) {
  const register = (command: string, intent: Parameters<typeof requestAiAssist>[0]) =>
    vscode.commands.registerTextEditorCommand(command, (editor) =>
      void withSelection(intent, editor),
    );

  context.subscriptions.push(
    register("aiMyHome.explainSelection", "explain"),
    register("aiMyHome.completeSelection", "complete"),
    register("aiMyHome.refactorSelection", "refactor"),
  );
}

export function deactivate() {}
