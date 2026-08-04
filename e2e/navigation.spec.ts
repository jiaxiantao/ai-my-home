import { expect, test } from "@playwright/test";

import { clickHeaderNavLink } from "./helpers/navigation";

test.describe("Site navigation", () => {
  test("header links to Notes redirect", async ({ page }) => {
    await page.goto("/");

    await clickHeaderNavLink(page, { group: "智能与内容", label: "Notes" });

    await expect(page).toHaveURL(/\/notes$/);
    await expect(page.getByText(/Knowledge Studio|正在跳转/)).toBeVisible();
  });

  test("header links to Assistant redirect", async ({ page }) => {
    await page.goto("/");

    await clickHeaderNavLink(page, { group: "智能与内容", label: "Assistant" });

    await expect(page).toHaveURL(/\/assistant$/);
    await expect(page.getByText(/Knowledge Studio|正在跳转/)).toBeVisible();
  });

  test("engineering demo tabs switch", async ({ page }) => {
    await page.goto("/");

    const workerTab = page.getByRole("button", { name: /Web Worker/i });
    await expect(workerTab).toBeVisible({ timeout: 30_000 });
    await workerTab.scrollIntoViewIfNeeded();
    await workerTab.click();

    await expect(
      page.getByRole("button", { name: /对比主线程 vs Worker/i }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
