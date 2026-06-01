import { expect, type Page } from "@playwright/test";

const hrefByLabel: Record<string, string> = {
  Notes: "/notes",
  Assistant: "/assistant",
  Agents: "/agents",
  Cases: "/cases",
};

const testIdByLabel: Record<string, string> = {
  Notes: "nav-ai-notes",
  Assistant: "nav-ai-assistant",
  Agents: "nav-ai-agents",
  Cases: "nav-ai-cases",
};

/** Header nav links sit in dropdown panels (always mounted, toggled via opacity). */
export async function clickHeaderNavLink(
  page: Page,
  options: { group: string; label: string },
) {
  const header = page.locator("header");
  const testId = testIdByLabel[options.label];
  const link = testId
    ? header.getByTestId(testId)
    : header.getByRole("link", { name: options.label, exact: true });
  const groupButton = header.getByRole("button", { name: options.group, exact: true });
  const mobileMenu = header.getByRole("button", { name: "打开菜单" });

  if (await mobileMenu.isVisible()) {
    await mobileMenu.click();
    await expect(link).toBeVisible({ timeout: 15_000 });
    await link.click();
    return;
  }

  if (await groupButton.isVisible()) {
    await groupButton.click();
    await link.click({ force: true, timeout: 15_000 });
    return;
  }

  const fallback = hrefByLabel[options.label];
  if (fallback) {
    await page.goto(fallback);
    return;
  }

  throw new Error(`Unable to navigate to header link: ${options.label}`);
}
