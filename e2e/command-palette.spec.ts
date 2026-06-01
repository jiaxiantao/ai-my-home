import { expect, test } from "@playwright/test";

test("command palette opens with meta+k and navigates", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press(process.platform === "darwin" ? "Meta+k" : "Control+k");

  const dialog = page.getByRole("dialog", { name: "快捷导航" });
  await expect(dialog).toBeVisible();

  await dialog.getByRole("link", { name: "发布中心" }).click();
  await expect(page).toHaveURL(/\/release-center/);
});
