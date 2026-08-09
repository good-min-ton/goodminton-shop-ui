/**
 * The bell and the order search.
 *
 * An order changes hands three times and every handoff used to be silent, so
 * orders sat in PENDING until somebody happened to look. These cover the two
 * things that fix that: being told it is your turn, and being able to find the
 * order a customer is calling about.
 *
 * The API is mocked; this is about the admin UI.
 */
import { test, expect, type Page } from "@playwright/test";

const envelope = (result: unknown) => JSON.stringify({ code: 1000, result });

const NOTIFICATIONS = [
  {
    id: 1,
    orderId: 42,
    type: "ORDER_AWAITING_CONFIRMATION",
    message: "Đơn hàng #42 đang chờ xác nhận",
    read: false,
    createdAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
  },
  {
    id: 2,
    orderId: 41,
    type: "ORDER_COMPLETED",
    message: "Đơn hàng #41 đã hoàn tất",
    read: true,
    createdAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
  },
];

/** Signs in as a super admin by seeding the auth store's persisted state. */
async function asAdmin(page: Page) {
  // Matches lib/auth-storage.ts, which keys each field separately.
  await page.addInitScript(() => {
    localStorage.setItem("gm.accessToken", "test-token");
    localStorage.setItem("gm.refreshToken", "test-refresh");
    localStorage.setItem(
      "gm.user",
      JSON.stringify({
        id: 1,
        fullName: "Test Admin",
        email: "a@e.com",
        phone: "0900000000",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      }),
    );
  });
}

async function mockApi(page: Page, opts: { unread?: number } = {}) {
  await page.route("**/api/notifications/unread-count**", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: envelope(opts.unread ?? 1) }),
  );
  await page.route("**/api/notifications?**", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: envelope({ content: NOTIFICATIONS, page: { number: 0, size: 20, totalElements: 2, totalPages: 1 } }),
    }),
  );
  // The stream must never be required: leave it hanging to prove the bell works
  // on polling alone, which is the guarantee the design rests on.
  await page.route("**/api/notifications/stream**", () => {});
  await page.route("**/api/orders**", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: envelope({ content: [], page: { number: 0, size: 20, totalElements: 0, totalPages: 0 } }),
    }),
  );
}

test("the bell shows an unread badge and lists what needs doing", async ({ page }) => {
  await asAdmin(page);
  await mockApi(page, { unread: 3 });

  await page.goto("/admin/orders");
  const bell = page.getByRole("button", { name: /Thông báo/i });
  await expect(bell).toBeVisible();
  await expect(bell).toContainText("3");

  await bell.click();
  await expect(page.getByText("Đơn hàng #42 đang chờ xác nhận")).toBeVisible();
  // Relative time is what signals an order is aging.
  await expect(page.getByText("3 giờ trước")).toBeVisible();
  await expect(page.getByText("1 ngày trước")).toBeVisible();
});

test("the badge is absent when there is nothing to do", async ({ page }) => {
  await asAdmin(page);
  await mockApi(page, { unread: 0 });

  await page.goto("/admin/orders");
  const bell = page.getByRole("button", { name: /^Thông báo$/i });
  await expect(bell).toBeVisible();
  await expect(bell).not.toContainText("0");
});

test("the bell works without the SSE stream ever connecting", async ({ page }) => {
  // The whole design rests on polling being the delivery mechanism: the API is
  // reached through a tunnel whose behaviour with long-lived streams is
  // unverified, so a hanging stream must cost nothing.
  await asAdmin(page);
  await mockApi(page, { unread: 2 });

  await page.goto("/admin/orders");
  await expect(page.getByRole("button", { name: /Thông báo/i })).toContainText("2");
});

test("searching by tracking code asks the search endpoint, not the list", async ({
  page,
}) => {
  await asAdmin(page);
  await mockApi(page);

  const searched: string[] = [];
  await page.route("**/api/orders/search**", (r) => {
    searched.push(new URL(r.request().url()).searchParams.get("q") ?? "");
    return r.fulfill({
      status: 200,
      contentType: "application/json",
      body: envelope({
        content: [
          {
            id: 42, customerId: 1, customerName: "Nguyen Van A",
            storeId: 1, storeName: "HQ", orderType: "ONLINE", status: "SHIPPING",
            totalAmount: 2689000, shippingCode: "GHN123456",
            statusChangedAt: new Date(Date.now() - 100 * 3600_000).toISOString(),
            recipientName: "A", recipientPhone: "0912345678", recipientAddress: "x",
            recipientEmail: null, note: null, orderDate: new Date().toISOString(),
            items: [], payments: [],
          },
        ],
        page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
      }),
    });
  });

  await page.goto("/admin/orders");
  await page.getByLabel(/Tìm đơn hàng theo mã vận đơn/i).fill("GHN123456");
  await page.getByRole("button", { name: "Tìm", exact: true }).click();

  await expect.poll(() => searched).toContain("GHN123456");
  await expect(page.getByText("Nguyen Van A")).toBeVisible();
});

test("an order overdue in its status is flagged, not just dated", async ({ page }) => {
  await asAdmin(page);
  await mockApi(page);
  await page.route("**/api/orders/search**", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: envelope({
        content: [
          {
            id: 7, customerId: 1, customerName: "Cham Tre",
            storeId: 1, storeName: "HQ", orderType: "ONLINE", status: "PENDING",
            totalAmount: 100000, shippingCode: null,
            // 4 days in PENDING, well past the 12-hour threshold.
            statusChangedAt: new Date(Date.now() - 96 * 3600_000).toISOString(),
            recipientName: "B", recipientPhone: "0900000001", recipientAddress: "x",
            recipientEmail: null, note: null, orderDate: new Date().toISOString(),
            items: [], payments: [],
          },
        ],
        page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
      }),
    }),
  );

  await page.goto("/admin/orders");
  await page.getByLabel(/Tìm đơn hàng theo mã vận đơn/i).fill("0900000001");
  await page.getByRole("button", { name: "Tìm", exact: true }).click();

  await expect(page.getByText("4 ngày")).toBeVisible();
  await expect(page.getByTitle(/Đã quá 12 giờ/)).toBeVisible();
});
