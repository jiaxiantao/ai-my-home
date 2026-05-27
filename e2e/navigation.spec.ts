import { expect, test } from "@playwright/test";

test.describe("Site navigation", () => {
  test("header links to Notes", async ({ page }) => {
    await page.goto("/");

    await page
      .locator("header")
      .getByRole("link", { name: "Notes", exact: true })
      .click();

    await expect(page).toHaveURL(/\/notes$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /PostgreSQL|笔记/,
    );
  });

  test("header links to Assistant", async ({ page }) => {
    await page.goto("/");

    await page
      .locator("header")
      .getByRole("link", { name: "Assistant", exact: true })
      .click();

    await expect(page).toHaveURL(/\/assistant$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /AI 对话工作台/,
    );
    await expect(page.getByText("正在加载对话工作台…")).toBeHidden({
      timeout: 30_000,
    });
    await expect(page.getByText("Sessions")).toBeVisible({ timeout: 5_000 });
  });

  test("engineering demo tabs switch", async ({ page }) => {
    await page.goto("/");
    await page.locator("#tech-demos").scrollIntoViewIfNeeded();

    const workerTab = page.getByRole("button", { name: /Web Worker/i });
    await expect(workerTab).toBeVisible({ timeout: 30_000 });
    await workerTab.click();

    await expect(
      page.getByRole("button", { name: /对比主线程 vs Worker/i }),
    ).toBeVisible({ timeout: 15_000 });

    const searchTab = page.getByRole("button", { name: /检索对比/i });
    await searchTab.click();

    await expect(
      page.getByRole("button", { name: /并行对比检索/i }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
