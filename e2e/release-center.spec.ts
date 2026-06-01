import { expect, test } from "@playwright/test";

test.describe("Release Center", () => {
  test("page loads metrics and pipeline section", async ({ page }) => {
    await page.goto("/release-center");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "工程化发布单",
    );
    const main = page.locator("main");
    await expect(main.getByText("应用数", { exact: true }).first()).toBeVisible();
    await expect(main.getByText("发布流水线执行")).toBeVisible();
  });

  test("guest cannot create release order", async ({ page }) => {
    await page.goto("/release-center");

    await expect(page.getByText("游客模式")).toBeVisible();
    await expect(page.getByRole("button", { name: "创建发布单" })).toBeDisabled();
  });

  test("status filters render", async ({ page }) => {
    await page.goto("/release-center");

    await expect(page.getByRole("button", { name: /全部 \(\d+\)/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /草稿 \(\d+\)/ })).toBeVisible();
  });
});
