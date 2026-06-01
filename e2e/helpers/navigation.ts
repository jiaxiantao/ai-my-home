import { expect, type Page } from "@playwright/test";

/** Header nav links live inside hover/click dropdowns on desktop or the mobile sheet menu. */
export async function clickHeaderNavLink(
  page: Page,
  options: { group: string; label: string },
) {
  const header = page.locator("header");
  const link = header.getByRole("link", { name: options.label, exact: true });

  if (await link.isVisible()) {
    await link.click();
    return;
  }

  const openMenu = header.getByRole("button", { name: "打开菜单" });
  if (await openMenu.isVisible()) {
    await openMenu.click();
    await expect(link).toBeVisible({ timeout: 10_000 });
    await link.click();
    return;
  }

  await header.getByRole("button", { name: options.group, exact: true }).click();
  await expect(link).toBeVisible({ timeout: 10_000 });
  await link.click();
}
