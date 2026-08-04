import { expect, test } from "@playwright/test";

test.describe("Assistant redirect", () => {
  test("redirects to Knowledge Studio", async ({ page }) => {
    await page.goto("/assistant");

    await expect(page).toHaveURL(/knowledge-studio\/assistant/, { timeout: 30_000 });
  });
});
