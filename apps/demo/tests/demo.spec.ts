import { expect, test } from "@playwright/test";

test("サンプル文を挿入し、ルールベース検出とマスキングを確認できる", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "安全化ワークベンチ" })).toBeVisible();
  await expect(page.getByText("3ステップで確認")).toBeVisible();

  await page.getByRole("link", { name: "デモ", exact: true }).click();
  await page.getByRole("button", { name: "ルール用サンプル" }).click();
  await expect(page.getByPlaceholder("ここにAIへ送る前の文章を入力してください。")).toHaveValue(/taro@example\.com/);

  await page.getByRole("button", { name: "検出する" }).click();
  await expect(page.getByText("メールアドレス").first()).toBeVisible();
  await expect(page.getByText("[EMAIL_1]")).toBeVisible();
  await expect(page.getByText("[PHONE_1]")).toBeVisible();

  const emailFinding = page.locator("label").filter({ hasText: "メールアドレス" });
  await emailFinding.getByRole("checkbox").uncheck();
  await expect(page.locator("pre").filter({ hasText: "taro@example.com" })).toBeVisible();
  await expect(page.locator("pre").filter({ hasText: "[PHONE_1]" })).toBeVisible();
});
