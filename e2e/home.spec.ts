import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders hero and core sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    for (const id of ["viz", "dashboard", "tech-demos", "demo-lab", "topology"]) {
      await expect(page.locator(`#${id}`)).toBeAttached();
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    }
  });

  test("in-page anchors scroll to dashboard", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "全栈看板" }).click();
    await expect(page.locator("#dashboard")).toBeInViewport({ timeout: 15_000 });
  });

  test("sitemap and robots are served", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    expect(await sitemap.text()).toContain("/notes");

    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toContain("Sitemap");
  });
});
