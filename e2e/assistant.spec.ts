import { expect, test } from "@playwright/test";

test.describe("Assistant redirect", () => {
  test("redirects to Knowledge Studio", async ({ page }) => {
    await page.goto("/assistant");

    await expect(page.getByText(/Knowledge Studio|正在跳转/)).toBeVisible();
  });
});
