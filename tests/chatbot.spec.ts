import { test, expect } from "@playwright/test";

test("chatbot widget opens and shows the empty-state suggestions + input", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Mở trợ lý/i }).click();

  const dialog = page.getByRole("dialog", { name: /Trợ lý Goodminton/i });
  await expect(dialog).toBeVisible();

  await expect(dialog.getByText("Mình mới chơi, nên chọn vợt nào?")).toBeVisible();
  await expect(dialog.getByPlaceholder(/Hỏi gì đó về vợt cầu lông/i)).toBeVisible();
});

test("checkout redirects unauthenticated users to /login", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page).toHaveURL(/\/login/);
});
