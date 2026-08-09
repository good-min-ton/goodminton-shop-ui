/**
 * Every backend call must carry ngrok-skip-browser-warning.
 *
 * Both APIs sit behind a public tunnel. Without this header ngrok's free tier
 * answers a browser-looking request with an HTML interstitial instead of
 * proxying it, so `fetch` gets markup where it expects JSON. The failure reads
 * exactly like a CORS or backend problem, which is why it is worth pinning
 * rather than trusting that four separate call sites all remember it.
 */
import { test, expect, type Page, type Request } from "@playwright/test";

const HEADER = "ngrok-skip-browser-warning";

/** Records the headers of every request to the two API hosts. */
function recordApiRequests(page: Page): Request[] {
  const seen: Request[] = [];
  page.on("request", (r) => {
    if (/127\.0\.0\.1:(8080|8081)/.test(r.url())) seen.push(r);
  });
  return seen;
}

test("the shop API client sends the tunnel header", async ({ page }) => {
  const seen = recordApiRequests(page);
  await page.route("**/127.0.0.1:8080/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ code: 1000, result: { content: [], page: {} } }),
    }),
  );

  await page.goto("/products");
  await expect
    .poll(() => seen.length, { message: "no shop-api call was made" })
    .toBeGreaterThan(0);

  for (const request of seen) {
    expect(request.headers()[HEADER], `missing on ${request.url()}`).toBe("true");
  }
});

test("the chat client sends the tunnel header", async ({ page }) => {
  const seen = recordApiRequests(page);
  await page.route("**/chat", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ answer: "Chào bạn.", sources: [] }),
    }),
  );

  await page.goto("/");
  await page.getByRole("button", { name: /Mở trợ lý/i }).click();
  const dialog = page.getByRole("dialog", { name: /Trợ lý Goodminton/i });
  await dialog.getByPlaceholder(/Hỏi gì đó/i).fill("xin chào");
  await dialog.getByRole("button", { name: "Gửi" }).click();
  await expect(dialog.getByText("Chào bạn.")).toBeVisible();

  const chatCalls = seen.filter((r) => r.url().includes("/chat"));
  expect(chatCalls.length, "no chat call was made").toBeGreaterThan(0);
  for (const request of chatCalls) {
    expect(request.headers()[HEADER]).toBe("true");
  }
});
