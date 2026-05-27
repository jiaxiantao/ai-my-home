import { expect, test } from "@playwright/test";

test.describe("Site navigation", () => {
  test("header links to Notes", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("navigation")
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
      .getByRole("navigation")
      .getByRole("link", { name: "Assistant", exact: true })
      .click();

    await expect(page).toHaveURL(/\/assistant$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/SSE|召回/);
  });

  test("engineering demo tabs switch", async ({ page }) => {
    await page.goto("/#tech-demos");

    await page.getByRole("button", { name: /Web Worker/i }).click();
    await expect(
      page.getByRole("button", { name: /对比主线程 vs Worker/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: /检索对比/i }).click();
    await expect(
      page.getByRole("button", { name: /并行对比检索/i }),
    ).toBeVisible();
  });
});
