import { expect, test } from "@playwright/test";

test.describe("Edge AI showcase", () => {
  test("switches browser ML tab on homepage", async ({ page }) => {
    await page.goto("/#edge-ai");
    const section = page.locator("#edge-ai");
    await expect(section).toBeVisible({ timeout: 30_000 });

    await expect(
      section.getByRole("button", { name: "Transformers.js" }),
    ).toBeVisible({
      timeout: 30_000,
    });

    const composerTab = section.getByRole("button", { name: /Prompt 编排/ });
    await composerTab.click();

    await expect(section.getByText("意图识别 · 改写")).toBeVisible({
      timeout: 30_000,
    });

    await expect(section.getByRole("link", { name: /Agents/i })).toBeVisible();
  });
});
