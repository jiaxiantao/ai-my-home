import { expect, test } from "@playwright/test";

test.describe("Assistant redirect", () => {
  test("redirects to Knowledge Studio", async ({ page }) => {
    await page.goto("/assistant");

    await expect(page.getByRole("link", { name: /若未自动跳转/ })).toHaveAttribute(
      "href",
      /knowledge-studio\/assistant/,
    );
  });
});
