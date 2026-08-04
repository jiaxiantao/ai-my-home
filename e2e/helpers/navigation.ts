import { expect, type Page } from "@playwright/test";

const hrefByLabel: Record<string, string> = {
  Notes: "/notes",
  Assistant: "/assistant",
  Agents: "/agents",
  Cases: "/cases",
};

const urlPatternByLabel: Record<string, RegExp> = {
  Notes: /(\/notes$|knowledge-studio\/notes)/,
  Assistant: /(\/assistant$|knowledge-studio\/assistant)/,
};

const testIdByLabel: Record<string, string> = {
  Notes: "nav-ai-notes",
  Assistant: "nav-ai-assistant",
  Agents: "nav-ai-agents",
  Cases: "nav-ai-cases",
};

/** Open the header menu and navigate (no force click — avoids hitting page content below). */
export async function clickHeaderNavLink(
  page: Page,
  options: { group: string; label: string },
) {
  const href = hrefByLabel[options.label];
  if (!href) {
    throw new Error(`Unknown header nav label: ${options.label}`);
  }

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
  } else {
    await groupButton.click();
    await expect(groupButton).toHaveAttribute("aria-expanded", "true", {
      timeout: 10_000,
    });
    await expect(link).toBeVisible({ timeout: 10_000 });
    await link.click();
  }

  const urlPattern =
    urlPatternByLabel[options.label] ??
    new RegExp(`${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`);

  await page.waitForURL(urlPattern, {
    timeout: 30_000,
  });
}
