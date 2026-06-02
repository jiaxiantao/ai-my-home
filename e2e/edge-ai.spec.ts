import { expect, test } from "@playwright/test";

test.describe("Edge AI showcase", () => {
  test("switches browser ML tab on homepage", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#edge-ai");
    await section.scrollIntoViewIfNeeded();

    await expect(
      section.getByRole("button", { name: "Transformers.js" }),
    ).toBeVisible({
      timeout: 30_000,
    });

    const agentTab = section.getByRole("button", { name: "Agent 编排" });
    await agentTab.click();

    await expect(section.getByText(/简化 Agent 循环/)).toBeVisible({
      timeout: 30_000,
    });
  });
});
