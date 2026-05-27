import { expect, test } from "@playwright/test";

test.describe("Agents page", () => {
  test("loads orchestration workspace", async ({ page }) => {
    await page.goto("/agents");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /AI Agent/,
    );
    await expect(page.getByRole("button", { name: "运行 Agent 循环" })).toBeVisible();
  });
});
