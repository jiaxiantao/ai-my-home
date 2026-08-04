import { expect, test } from "@playwright/test";

test.describe("Status page", () => {
  test("loads diagnostics UI", async ({ page }) => {
    await page.goto("/status");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/运行时诊断/);
    const runButton = page.getByRole("button", { name: "并行探测" });
    await expect(runButton).toBeVisible();
    await expect(
      page.getByRole("link", { name: /GET \/api\/dashboard/i }).first(),
    ).toBeVisible();
    await runButton.click();
    await expect(page.getByText("API 延迟探测")).toBeVisible({ timeout: 20_000 });
  });
});
