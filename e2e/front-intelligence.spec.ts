import { expect, test } from "@playwright/test";

test.describe("Front Intelligence", () => {
  test("composer section shows intent chips", async ({ page }) => {
    await page.goto("/#front-intelligence");

    await expect(page.getByText("前端智能化编排台")).toBeVisible();
    await expect(page.getByRole("button", { name: /性能优化/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("link", { name: /带到 Assistant/i })).toBeVisible();
  });

  test("analyze API returns intents", async ({ request }) => {
    const response = await request.post("/api/intelligence/analyze", {
      data: {
        input: "CI 发布流程如何加质量门禁",
      },
    });

    expect(response.ok()).toBeTruthy();
    const payload = (await response.json()) as {
      intelligence?: { intents?: Array<{ label: string }> };
    };
    expect(payload.intelligence?.intents?.length).toBeGreaterThan(0);
  });
});
