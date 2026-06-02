import { expect, test } from "@playwright/test";

test.describe("Status page", () => {
  test("loads diagnostics UI", async ({ page }) => {
    await page.goto("/status");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/运行时诊断/);
    const runButton = page.getByRole("button", { name: "并行探测" });
    await expect(runButton).toBeVisible();
    await expect(
      page.getByRole("link", { name: /SSE \/api\/agent/i }).first(),
    ).toBeVisible();
    await runButton.click();
    await expect(page.getByText("Agent p50")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Agent 趋势")).toBeVisible({ timeout: 20_000 });
  });
});
