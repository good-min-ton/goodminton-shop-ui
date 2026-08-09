/**
 * What the chat bubble does with the Markdown the model emits.
 *
 * The renderer covers a deliberately small subset and degrades everything else
 * to clean text. The cases here are the ones that reached a customer: raw `**`
 * before the renderer existed, and a bare "!Bảng chọn sản phẩm" after it - an
 * image placeholder the model invented for the picker the app was already
 * showing, whose `!` survived because only the link half was handled.
 *
 * The RAG service is mocked; this is about rendering.
 */
import { test, expect, type Page } from "@playwright/test";

async function answer(page: Page, text: string) {
  await page.route("**/chat", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ answer: text, sources: [], display_products: [] }),
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: /Mở trợ lý/i }).click();
  const dialog = page.getByRole("dialog", { name: /Trợ lý Goodminton/i });
  await dialog.getByPlaceholder(/Hỏi gì đó/i).fill("mua vợt");
  await dialog.getByRole("button", { name: "Gửi" }).click();
  return dialog;
}

test("an invented image placeholder leaves nothing behind", async ({ page }) => {
  const dialog = await answer(
    page,
    "Bạn có muốn xem chi tiết và đặt hàng không?\n\n![Bảng chọn sản phẩm](picker)",
  );

  await expect(
    dialog.getByText(/Bạn có muốn xem chi tiết và đặt hàng không\?/),
  ).toBeVisible();
  // The reported symptom: the alt text surviving with its exclamation mark.
  await expect(dialog.getByText(/!Bảng chọn/)).toBeHidden();
  await expect(dialog.getByText(/Bảng chọn sản phẩm/)).toBeHidden();
});

test("an exclamation mark in ordinary prose is untouched", async ({ page }) => {
  const dialog = await answer(page, "Chỉ 2.689.000đ thôi! Bạn xem thử nhé.");

  await expect(
    dialog.getByText("Chỉ 2.689.000đ thôi! Bạn xem thử nhé."),
  ).toBeVisible();
});

test("bold and bullets render as structure, not as syntax", async ({ page }) => {
  const dialog = await answer(
    page,
    "Mình gợi ý **Yonex Astrox 99 Game**:\n\n- Thiên công\n- Dễ đánh",
  );

  await expect(dialog.locator("strong", { hasText: "Astrox 99 Game" })).toBeVisible();
  await expect(dialog.locator("ul li")).toHaveCount(2);
  const shown = await dialog.innerText();
  expect(shown).not.toMatch(/\*\*/);
});

test("a markdown link keeps its label and drops the url", async ({ page }) => {
  const dialog = await answer(page, "Xem [trang sản phẩm](https://shop.vn/p/1) nhé.");

  await expect(dialog.getByText("Xem trang sản phẩm nhé.")).toBeVisible();
  expect(await dialog.innerText()).not.toContain("shop.vn");
});
