import { expect, test } from "@playwright/test";

test("command palette opens with meta+k and navigates", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press(process.platform === "darwin" ? "Meta+k" : "Control+k");

  const dialog = page.getByRole("dialog", { name: "快捷导航" });
  await expect(dialog).toBeVisible();

  await dialog.getByRole("link", { name: "发布中心" }).click();
  await expect(page).toHaveURL(/\/release-center/);
});

test("command palette can ask assistant", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press(process.platform === "darwin" ? "Meta+k" : "Control+k");

  const dialog = page.getByRole("dialog", { name: "快捷导航" });
  await dialog.locator("input").fill("前端性能治理");
  await dialog.getByRole("button", { name: "向 Assistant 提问" }).click();

  await expect(page).toHaveURL(/knowledge-studio\/assistant\?q=/);
});
