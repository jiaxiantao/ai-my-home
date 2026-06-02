import { expect, test } from "@playwright/test";

test.describe("Assistant", () => {
  test("loads advanced chat workspace", async ({ page }) => {
    await page.goto("/assistant");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /AI 对话工作台/,
    );
    await expect(page.getByText("正在加载对话工作台…")).toBeHidden({
      timeout: 30_000,
    });
    await expect(page.getByText("Sessions")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole("button", { name: "停止生成" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "发送" })).toBeVisible();
  });

  test("shows contextual engineering links when typing", async ({ page }) => {
    await page.goto("/assistant");
    await expect(page.getByText("正在加载对话工作台…")).toBeHidden({
      timeout: 30_000,
    });

    const composer = page.locator("textarea").last();
    await composer.fill("前端性能优化排查路径");
    await expect(page.getByText("相关工程能力")).toBeVisible();
    await expect(page.getByRole("link", { name: /性能治理台/ })).toBeVisible();
  });
});
