import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders hero and core sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    for (const id of [
      "capability-radar",
      "front-intelligence",
      "viz",
      "dashboard",
      "release-center",
      "cross-platform",
      "edge-ai",
      "tech-demos",
      "demo-lab",
      "topology",
    ]) {
      const section = page.locator(`#${id}`);
      await expect(section).toBeAttached();
      await section.evaluate((node) => {
        node.scrollIntoView({ block: "center", behavior: "instant" });
      });
    }
  });

  test("in-page anchors scroll to dashboard", async ({ page }) => {
    await page.goto("/");

    const header = page.locator("header");
    const mobileMenu = header.getByRole("button", { name: "打开菜单" });

    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await header.getByRole("link", { name: "看板", exact: true }).click();
    } else {
      await header.getByRole("button", { name: "工程与能力", exact: true }).click();
      await header.getByTestId("nav-engineering-看板").click();
    }

    await expect(page.locator("#dashboard")).toBeInViewport({ timeout: 15_000 });
  });

  test("capability radar lists scored dimensions", async ({ page }) => {
    await page.goto("/#capability-radar");
    const section = page.locator("#capability-radar");
    await expect(section).toBeVisible({ timeout: 30_000 });

    await expect(
      section.getByRole("button", { name: /全栈 API/ }),
    ).toBeVisible();
    await expect(section.getByRole("button", { name: /CI\/CD/ })).toBeVisible();
    await expect(section.getByText(/当前高亮：/)).toBeVisible();
  });

  test("demo lab URL state renders system map", async ({ page }) => {
    await page.goto(
      "/?lab=architecture&scenario=content-platform#demo-lab",
    );
    const section = page.locator("#demo-lab");
    await expect(section).toBeVisible({ timeout: 20_000 });

    await expect(section.getByText("System Map")).toBeVisible({
      timeout: 20_000,
    });
    await expect(section.getByText("Demo Lab → 智能编排")).toBeVisible();
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
