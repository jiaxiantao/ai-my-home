import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders hero and proof sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("#viz")).toBeVisible();
    await expect(page.locator("#dashboard")).toBeVisible();
    await expect(page.locator("#tech-demos")).toBeVisible();
    await expect(page.locator("#demo-lab")).toBeVisible();
    await expect(page.locator("#topology")).toBeVisible();
  });

  test("in-page anchors are reachable", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "全栈看板" }).click();
    await expect(page.locator("#dashboard")).toBeInViewport();
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
