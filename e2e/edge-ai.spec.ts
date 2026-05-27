import { expect, test } from "@playwright/test";

test.describe("Edge AI showcase", () => {
  test("switches browser ML tab on homepage", async ({ page }) => {
    await page.goto("/#edge-ai");
    await page.locator("#edge-ai").scrollIntoViewIfNeeded();

    await expect(page.getByRole("button", { name: "Transformers.js" })).toBeVisible({
      timeout: 15_000,
    });

    const agentTab = page.getByRole("button", { name: "Agent 编排" });
    await agentTab.scrollIntoViewIfNeeded();
    await agentTab.click();
    await expect(page.getByText("简化 Agent 循环")).toBeVisible({
      timeout: 20_000,
    });
  });
});
