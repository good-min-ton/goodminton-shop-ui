/**
 * The chat variant picker.
 *
 * Choosing used to happen in prose: the bot asked "which size?", the customer
 * typed a reply, and the model mapped it back to a variant_id - slow, and the
 * step that produced wrong-variant orders. These cover the rules that make the
 * tapping version safe: a combination nobody stocks cannot be picked, quantity
 * cannot exceed what checkout can deduct, and an out-of-stock choice points at
 * a branch instead of leaving a dead button.
 *
 * The RAG service is mocked; this is about the picker's own behaviour.
 */
import { test, expect, type Page } from "@playwright/test";

const opt = (
  variant_id: string,
  size: string | null,
  color: string | null,
  orderable: number,
  branches: { store_id: number; store_name: string; quantity: number }[] = [],
) => ({ variant_id, size, color, unit_price: 2689000, orderable, branches });

/** 4U exists in Đỏ(7) and Xanh(0 + branch); 3U only in Đỏ(2). No 3U/Xanh. */
const SELECTION = {
  product_id: "12",
  product_name: "Yonex Astrox 99 Game",
  currency: "VND",
  options: [
    opt("45", "4U", "Đỏ", 7),
    opt("46", "4U", "Xanh", 0, [
      { store_id: 2, store_name: "Chi nhánh Q7", quantity: 4 },
    ]),
    opt("47", "3U", "Đỏ", 2),
  ],
};

async function openPicker(page: Page, selection: unknown = SELECTION) {
  await page.route("**/chat", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        answer: "Mời bạn chọn bên dưới nhé.",
        sources: [],
        order_selection: selection,
        display_products: [],
      }),
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: /Mở trợ lý/i }).click();
  const dialog = page.getByRole("dialog", { name: /Trợ lý Goodminton/i });
  await dialog.getByPlaceholder(/Hỏi gì đó/i).fill("mua vợt Astrox 99");
  await dialog.getByRole("button", { name: "Gửi" }).click();
  await expect(dialog.getByText("Mời bạn chọn bên dưới nhé.")).toBeVisible();
  return dialog;
}

test("size and colour chips render and gate the continue step", async ({ page }) => {
  const dialog = await openPicker(page);

  await expect(dialog.getByRole("button", { name: "4U", exact: true })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "3U", exact: true })).toBeVisible();
  await expect(dialog.getByText("Chọn size để tiếp tục")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Tiếp tục" })).toBeHidden();

  await dialog.getByRole("button", { name: "4U", exact: true }).click();
  await dialog.getByRole("button", { name: "Đỏ", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Tiếp tục" })).toBeVisible();
});

test("a combination nobody stocks is not offerable", async ({ page }) => {
  const dialog = await openPicker(page);

  // 3U exists only in Đỏ, so Xanh must go dead once 3U is chosen.
  await dialog.getByRole("button", { name: "3U", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Xanh", exact: true })).toBeDisabled();
  await expect(dialog.getByRole("button", { name: "Đỏ", exact: true })).toBeEnabled();
});

test("quantity cannot exceed central stock", async ({ page }) => {
  const dialog = await openPicker(page);
  await dialog.getByRole("button", { name: "3U", exact: true }).click();
  await dialog.getByRole("button", { name: "Đỏ", exact: true }).click();

  const plus = dialog.getByRole("button", { name: "Tăng số lượng" });
  await plus.click(); // 2 - the whole of orderable
  await expect(plus).toBeDisabled();
  await expect(dialog.getByText("Chỉ còn 2 sản phẩm.")).toBeVisible();
  await expect(dialog.getByText("5.378.000đ")).toBeVisible(); // 2 x 2.689.000
});

test("an out-of-stock choice offers the branch instead of a dead button", async ({
  page,
}) => {
  const dialog = await openPicker(page);
  await dialog.getByRole("button", { name: "4U", exact: true }).click();
  await dialog.getByRole("button", { name: "Xanh", exact: true }).click();

  await expect(dialog.getByText(/đang hết hàng đặt online/i)).toBeVisible();
  await expect(dialog.getByText(/Chi nhánh Q7 \(4\)/)).toBeVisible();
  await expect(dialog.getByText(/liên hệ chi nhánh trước/i)).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Tiếp tục" })).toBeHidden();
});

test("committing replaces the picker with the confirm step", async ({ page }) => {
  const dialog = await openPicker(page);
  await dialog.getByRole("button", { name: "4U", exact: true }).click();
  await dialog.getByRole("button", { name: "Đỏ", exact: true }).click();
  await dialog.getByRole("button", { name: "Tiếp tục" }).click();

  // Picker is gone, the order card is showing the chosen variant.
  await expect(dialog.getByRole("button", { name: "Tiếp tục" })).toBeHidden();
  await expect(dialog.getByText("4U · Đỏ")).toBeVisible();
  await expect(dialog.getByText("Tổng cộng")).toBeVisible();
  // Guest: the card asks to log in rather than showing a dead submit.
  await expect(dialog.getByText(/Vui lòng đăng nhập để đặt hàng/i)).toBeVisible();

  // The choice survives a reload (persisted on the message).
  await page.reload();
  await page.getByRole("button", { name: /Mở trợ lý/i }).click();
  await expect(dialog.getByText("4U · Đỏ")).toBeVisible();
});

test("a single-variant product skips straight to quantity", async ({ page }) => {
  const dialog = await openPicker(page, {
    ...SELECTION,
    options: [opt("99", "4U", null, 5)],
  });

  await expect(dialog.getByText(/Chọn size để tiếp tục/)).toBeHidden();
  await expect(dialog.getByRole("button", { name: "Tiếp tục" })).toBeVisible();
});
