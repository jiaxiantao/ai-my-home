import { expect, test } from "@playwright/test";

test.describe("Notes", () => {
  test("search demo returns results", async ({ page }) => {
    await page.goto("/notes");

    await page.getByRole("button", { name: "trgm 检索" }).click();

    await expect(page.locator("a[href^='/notes/']").first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test("search compare panel loads", async ({ page }) => {
    await page.goto("/notes");

    const compareButton = page.getByRole("button", { name: "并行对比检索" });
    await expect(compareButton).toBeVisible({ timeout: 30_000 });

    await compareButton.click();

    const comparePanel = page.locator("main");
    await expect(comparePanel.getByText("PostgreSQL pg_trgm").first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(comparePanel.getByText("内存 token 打分").first()).toBeVisible();
  });
});
