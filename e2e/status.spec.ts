import { expect, test } from "@playwright/test";

test.describe("Status page", () => {
  test("loads diagnostics UI", async ({ page }) => {
    await page.goto("/status");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/运行时诊断/);
    await expect(page.getByRole("button", { name: "并行探测" })).toBeVisible();
  });
});
