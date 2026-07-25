# Chatbot Order Assistant — UI Implementation Plan
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Render the RAG-produced `order_draft` as an `OrderConfirmCard` in the chatbot and let a logged-in shopper place a COD order via the existing `ordersApi.create`, with a durable single-write guard that survives reload.
**Architecture:** RAG returns a priced, stock-checked `order_draft` on the chat response (built first, in the RAG repo). The UI mirrors that canonical contract as TypeScript types, threads it onto the persisted assistant message, and mounts a new `OrderConfirmCard` inside `MessageBubble`. The card collects a shipping address and calls the existing checkout endpoint under the user's own JWT (auto-attached by `api.post`). The user's click is the only write; `placedOrderId` is persisted onto the message so the button never re-arms after a reload.
**Tech Stack:** Next.js 16, React 19, TypeScript (strict), `@tanstack/react-query` v5, Zustand auth store. No test runner in this repo.

## Verification method this repo actually supports
This repo has **NO test runner** — `package.json` has only `dev`/`build`/`start` scripts, there is no `jest`/`vitest` dependency or config, and there are zero `*.test.*` / `*.spec.*` / `__tests__` files. Per the plan brief we do **NOT** add a test runner or testing dependency (out of scope). The real automated gate is the TypeScript compiler:

```
npx tsc --noEmit
```

(run from the repo root `goodminton-shop-ui/`; `tsconfig.json` has `"noEmit": true` + `"strict": true` + the `@/*` path alias, so this typechecks the whole app.)

Each task therefore verifies with **(a) `npx tsc --noEmit` clean** plus **(b) concrete manual steps** (exact clicks + observations). Because Tasks 1 and 2 produce code that is not yet mounted, their behavioral proof is deferred to Task 3, whose final step is the spec's **mandatory end-to-end buy→confirm→placed→reload dry run** (the #1 demo-killer if skipped). This is called out explicitly in each task.

> **Supersedes spec must-do #3.** The spec's "UI: `tsc` clean + component tests green" is amended here: this repo has no test runner, so "component tests green" is **out of scope** (adding a runner/testing dependency is also out of scope). The real UI gate is **`npx tsc --noEmit` clean + the mandatory manual E2E dry run** (Task 3). Correspondingly, "test-first" reduces to "typecheck-first + mounted E2E," and the ~240-line `OrderConfirmCard` is created in one step (splitting it into micro-steps adds no verifiability without a runner). A future reader should treat the absent component tests as a deliberate, documented decision — not an oversight.

## Resolved open items (read from live code — use these exact shapes)
- **`toast` shape** — `store/toast-store.ts:33` exports a plain function: `export function toast(message: string, type: ToastType = "info", duration = 3500)`. Call it `toast("Đặt hàng thành công!", "success")`. Import: `import { toast } from "@/store/toast-store";`.
- **`getErrorMessage` signature** — `lib/error-messages.ts:30` `export function getErrorMessage(err: unknown, fallback?: string): string`. Call `getErrorMessage(err, "Đặt hàng thất bại")`. Import: `import { getErrorMessage } from "@/lib/error-messages";`. (Code `2302` insufficient-stock: no override map entry exists, so the backend Vietnamese `err.message` falls through — acceptable, non-blocking.)
- **`formatPrice` import path** — `lib/utils.ts:10` `export function formatPrice(...)`. Import: `import { formatPrice } from "@/lib/utils";`. Render prices as `` `${formatPrice(x)}đ` `` to match the existing `ProductSourceCards` style (`chat-panel.tsx:338`).
- **`productsApi.detail`** — `lib/api/products.ts:15` `detail(productId: number) => Promise<Product>`. Reuse the `useQueries` thumbnail pattern from `chat-panel.tsx:297-346`.
- **`ordersApi.create`** — `lib/api/orders.ts:14` `create(body: CreateOrderRequest) => Promise<Order>`; `Order.id: number`. `CreateOrderRequest` (`types/api.ts:278`) = `{ items:[{variantId:number, quantity:number}], recipientName, recipientPhone, recipientAddress, recipientEmail?, note?, paymentMethod }`.
- **Auth store** — `store/auth-store.ts` exposes `isHydrated`, `accessToken`, `user` (`Account` has `fullName`, `phone`, `email`). Bearer is auto-attached by `api.post` via `lib/auth-storage.ts` — the card sends **no** token.
- **Orders route** — `app/(storefront)/orders/[id]/page.tsx` exists, so `/orders/{id}` links resolve.

## Branch
This executes in `goodminton-shop-ui`. It extends the chatbot product cards that already exist on `feat/admin-generate-description`. Create the feature branch off that branch (not `main`):
```
git checkout feat/admin-generate-description
git checkout -b feat/chatbot-order-assistant
```
It CONSUMES the RAG canonical `order_draft` contract; the RAG plan is built first.

## Global Constraints (every task inherits these — do not violate)
1. **shop-api is not modified.** No new endpoints, no schema changes.
2. **The write is exclusively frontend-side** via the existing `ordersApi.create`. The user's click is the single write gate.
3. **The order request carries no price/customer/store.** Send only `{ items:[{variantId, quantity}], recipientName, recipientPhone, recipientAddress, recipientEmail?, note?, paymentMethod:"COD" }`. Draft prices are display-only; the server re-prices.
4. **The chat REQUEST is unchanged.** No token, no user id sent to RAG. `ChatRequest` is NOT touched. Only the chat RESPONSE gains `order_draft`.
5. **ONE canonical `order_draft` schema** (below) is byte-identical across the RAG tool output, the RAG Pydantic model, and the UI type. `product_id`/`variant_id` are **strings** in the contract; the UI does `Number()` only at the `ordersApi.create` boundary.
6. **Payment is COD only** for this feature (`paymentMethod: "COD"` hard-wired).
7. **Never silently coerce user intent.** The UI renders the draft authoritatively; it never re-prices, re-quantifies, or drops a line.
8. **Any warning blocks the whole order.** The confirm button is disabled when `draft.warnings.length > 0` OR `draft.items.length === 0`.
9. **Durable single-write guard.** After a successful order, `placedOrderId` is written onto the message (persisted to `localStorage["gm.chat-history"]`); the card then renders only the "Đã đặt hàng #id" link and never re-shows the form/button — surviving reload.

### Canonical `order_draft` contract (string ids — mirror EXACTLY)
```jsonc
{
  "items": [
    {
      "product_id": "12",       // string; UI does Number() before ordersApi.create
      "variant_id": "45",       // string; UI does Number()
      "product_name": "Vợt Yonex Astrox 100ZZ",
      "size": "4U",             // string | null (kept SEPARATE from name)
      "color": "Đỏ",            // string | null
      "quantity": 2,            // int >= 1
      "unit_price": 3200000.0,  // float VND, display-only
      "line_total": 6400000.0,  // float VND, display-only
      "in_stock": true          // central-store availability >= quantity
    }
  ],
  "total": 6400000.0,           // float VND, display-only
  "currency": "VND",
  "warnings": ["..."]           // flat strings; ANY entry disables ordering
}
```

---

### Task 1: Types + response threading
**Files:**
- Modify: `components/chatbot/types.ts` (add interfaces at end of file after line 28; extend `ChatMessage` at lines 3-12 and `ChatResponse` at lines 24-28)
- Modify: `components/chatbot/chat-panel.tsx:99-108` (assistant-message push in the `send` callback)
- Test: none (no test runner — verify via `npx tsc --noEmit` + manual localStorage inspection)
**Interfaces:**
- Consumes: RAG `ChatResponse.order_draft` (canonical contract above).
- Produces: `OrderDraftItem`, `OrderDraft` (exported from `./types`); `ChatResponse.order_draft?: OrderDraft`; `ChatMessage.order_draft?: OrderDraft`; `ChatMessage.placedOrderId?: number`. Tasks 2 and 3 rely on these exact names/types.

- [ ] **Step 1: Create the branch.**
  Run:
  ```
  cd /home/mgriffe-work/Desktop/TTTN/goodminton-shop-ui && git checkout feat/admin-generate-description && git checkout -b feat/chatbot-order-assistant
  ```
  Expected: `Switched to a new branch 'feat/chatbot-order-assistant'`.

- [ ] **Step 2: Add `OrderDraftItem` + `OrderDraft` interfaces to `types.ts`.**
  Append to the END of `components/chatbot/types.ts` (after line 28):
  ```ts

  /** One line of a RAG-prepared order draft. Mirrors the canonical contract
   *  EXACTLY — product_id/variant_id are STRINGS (RAG convention); the UI does
   *  Number() only at the ordersApi.create boundary. size/color are kept
   *  SEPARATE from product_name so a wrong-variant map is visible to the user. */
  export interface OrderDraftItem {
    product_id: string;
    variant_id: string;
    product_name: string;
    size: string | null;
    color: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
    in_stock: boolean;
  }

  /** Priced, stock-checked draft emitted by the RAG `prepare_order` tool. */
  export interface OrderDraft {
    items: OrderDraftItem[];
    total: number;
    currency: string;
    warnings: string[];
  }
  ```

- [ ] **Step 3: Thread `order_draft` onto `ChatResponse`.**
  In `components/chatbot/types.ts`, edit the `ChatResponse` interface (lines 24-28) to add the optional field:
  ```ts
  export interface ChatResponse {
    answer: string;
    sources: SourceRef[];
    products?: string[];
    order_draft?: OrderDraft;
  }
  ```

- [ ] **Step 4: Thread `order_draft` + `placedOrderId` onto `ChatMessage`.**
  In `components/chatbot/types.ts`, edit the `ChatMessage` interface (lines 3-12) to add two optional fields after `products?`:
  ```ts
  export interface ChatMessage {
    role: ChatRole;
    content: string;
    /** Local-only timestamp; not sent to backend. Used for keys + ordering. */
    ts?: number;
    /** Sources returned by backend for assistant messages. */
    sources?: SourceRef[];
    /** product_ids the answer recommends — drives the product cards. */
    products?: string[];
    /** Priced order draft returned by RAG for this assistant turn. */
    order_draft?: OrderDraft;
    /** Client-only: set to the created order id after a successful placement.
     *  Persisted to localStorage → durable single-write guard across reloads. */
    placedOrderId?: number;
  }
  ```

- [ ] **Step 5: Spread `order_draft` onto the assistant message in `send`.**
  In `components/chatbot/chat-panel.tsx`, edit the assistant-message push (lines 99-108) to carry the draft (parallels `products`):
  ```tsx
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.answer,
            sources: res.sources,
            products: res.products,
            order_draft: res.order_draft,
            ts: Date.now(),
          },
        ]);
  ```

- [ ] **Step 6: Typecheck.**
  Run: `cd /home/mgriffe-work/Desktop/TTTN/goodminton-shop-ui && npx tsc --noEmit`
  Expected: PASS — exit code 0, no output. (Confirms the contract types compile and `res.order_draft` is assignable to `ChatMessage.order_draft`.)

- [ ] **Step 7: Manual verification — draft persists onto the message.**
  With the RAG service running and returning a draft (or, if RAG isn't ready, temporarily stub `sendChat` to return an `order_draft`): open the app (`npm run dev`), open the chatbot, send "mua 2 vợt Astrox 100ZZ size 4U màu đỏ". In DevTools → Application → Local Storage → `gm.chat-history`, confirm the assistant message object contains an `order_draft` object with `items`/`total`/`currency`/`warnings`. Nothing renders yet (that's Task 3). Revert any temporary stub before committing.
  Expected: `order_draft` present on the persisted assistant message; no console errors.

- [ ] **Step 8: Commit.**
  Run:
  ```
  cd /home/mgriffe-work/Desktop/TTTN/goodminton-shop-ui && git add components/chatbot/types.ts components/chatbot/chat-panel.tsx && git commit -m "feat(chatbot): thread order_draft contract onto chat types

Mirror the canonical RAG order_draft (string ids) as OrderDraftItem/OrderDraft,
add order_draft to ChatResponse + ChatMessage, add client-only placedOrderId,
and spread order_draft onto the persisted assistant message.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
  ```

---

### Task 2: `OrderConfirmCard` component
**Files:**
- Create: `components/chatbot/order-confirm-card.tsx`
- Test: none (no test runner — verify via `npx tsc --noEmit`; behavioral proof deferred to Task 3's mounted E2E)
**Interfaces:**
- Consumes: `OrderDraft` from `./types` (Task 1); `ordersApi.create` (`@/lib/api/orders`); `productsApi.detail` (`@/lib/api/products`); `useAuthStore` (`@/store/auth-store`); `toast` (`@/store/toast-store`); `getErrorMessage` (`@/lib/error-messages`); `formatPrice`/`cn` (`@/lib/utils`).
- Produces: `export function OrderConfirmCard(props: { draft: OrderDraft; placedOrderId?: number; onPlaced: (id: number) => void })`. Task 3 mounts it and supplies `onPlaced`.

- [ ] **Step 1: Create `order-confirm-card.tsx` with the full component.**
  Create `components/chatbot/order-confirm-card.tsx`:
  ```tsx
  "use client";

  import { useEffect, useState } from "react";
  import Link from "next/link";
  import { usePathname, useRouter } from "next/navigation";
  import { useMutation, useQueries } from "@tanstack/react-query";
  import { AlertTriangle, CheckCircle2 } from "lucide-react";
  import { productsApi } from "@/lib/api/products";
  import { ordersApi } from "@/lib/api/orders";
  import { useAuthStore } from "@/store/auth-store";
  import { toast } from "@/store/toast-store";
  import { getErrorMessage } from "@/lib/error-messages";
  import { cn, formatPrice } from "@/lib/utils";
  import type { Product } from "@/types/api";
  import type { OrderDraft } from "./types";

  interface OrderConfirmCardProps {
    draft: OrderDraft;
    placedOrderId?: number;
    onPlaced: (id: number) => void;
  }

  export function OrderConfirmCard({
    draft,
    placedOrderId,
    onPlaced,
  }: Readonly<OrderConfirmCardProps>) {
    const router = useRouter();
    const pathname = usePathname();
    const isHydrated = useAuthStore((s) => s.isHydrated);
    const accessToken = useAuthStore((s) => s.accessToken);
    const user = useAuthStore((s) => s.user);

    const [recipientName, setRecipientName] = useState("");
    const [recipientPhone, setRecipientPhone] = useState("");
    const [recipientAddress, setRecipientAddress] = useState("");
    const [note, setNote] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Prefill name/phone once the auth store hydrates the user. The `|| v` keeps
    // any edit the user already made from being clobbered by a late hydrate.
    useEffect(() => {
      if (user) {
        setRecipientName((v) => v || user.fullName);
        setRecipientPhone((v) => v || user.phone);
      }
    }, [user]);

    // Thumbnails — failure-tolerant, NEVER gate ordering. Same useQueries pattern
    // as ProductSourceCards; on error/loading we simply show a placeholder.
    const productIds = Array.from(
      new Set(draft.items.map((l) => Number(l.product_id))),
    ).filter((n) => Number.isInteger(n) && n > 0);
    const thumbResults = useQueries({
      queries: productIds.map((id) => ({
        queryKey: ["product", id],
        queryFn: () => productsApi.detail(id),
        staleTime: 10 * 60 * 1000,
      })),
    });
    const thumbById = new Map<number, string | null>();
    for (const r of thumbResults) {
      const p = r.data as Product | undefined;
      if (p) thumbById.set(p.id, p.thumbnail?.url ?? null);
    }

    const placeOrder = useMutation({
      mutationFn: () =>
        ordersApi.create({
          items: draft.items.map((l) => ({
            variantId: Number(l.variant_id),
            quantity: l.quantity,
          })),
          recipientName,
          recipientPhone,
          recipientAddress,
          recipientEmail: user?.email || undefined,
          note: note || undefined,
          paymentMethod: "COD",
        }),
      onSuccess: (order) => {
        toast("Đặt hàng thành công!", "success");
        onPlaced(order.id);
        router.replace(`/orders/${order.id}`);
      },
      onError: (err) => {
        setErrorMsg(getErrorMessage(err, "Đặt hàng thất bại"));
      },
    });

    // Placed state — durable, survives reload. No form, no button.
    if (placedOrderId != null) {
      return (
        <Link
          href={`/orders/${placedOrderId}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
        >
          <CheckCircle2 size={15} />
          Đã đặt hàng #{placedOrderId}
        </Link>
      );
    }

    // Avoid a login-flash before the auth store hydrates.
    if (!isHydrated) return null;

    const disabled =
      placeOrder.isPending ||
      placeOrder.isSuccess ||
      draft.warnings.length > 0 ||
      draft.items.length === 0 ||
      !recipientName ||
      !recipientPhone ||
      !recipientAddress;

    return (
      <div className="w-full max-w-[85%] space-y-2 rounded-2xl rounded-bl-md border border-stone-200 bg-white p-3 shadow-sm">
        <ul className="space-y-2">
          {draft.items.map((l, idx) => {
            const thumb = thumbById.get(Number(l.product_id)) ?? null;
            const variant = [l.size, l.color].filter(Boolean).join(" · ");
            return (
              <li
                key={`${l.variant_id}-${idx}`}
                className={cn("flex gap-2", !l.in_stock && "opacity-50")}
              >
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-stone-100">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt={l.product_name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[9px] text-stone-400">
                      Ảnh
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[13px] font-medium text-stone-800">
                    {l.product_name}
                  </p>
                  {variant && (
                    <p className="text-primary-700 text-xs font-semibold">
                      {variant}
                    </p>
                  )}
                  <p className="text-[11px] text-stone-500">
                    × {l.quantity} · {formatPrice(l.unit_price)}đ
                    {!l.in_stock && (
                      <span className="ml-1 rounded bg-red-100 px-1 text-red-600">
                        hết hàng
                      </span>
                    )}
                  </p>
                </div>
                <span className="flex-shrink-0 text-[13px] font-semibold text-stone-800">
                  {formatPrice(l.line_total)}đ
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-sm font-bold text-stone-900">
          <span>Tổng cộng</span>
          <span className="text-primary-700">{formatPrice(draft.total)}đ</span>
        </div>

        {draft.warnings.length > 0 && (
          <div className="space-y-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {draft.warnings.map((w, i) => (
              <p key={`${i}-${w}`} className="flex gap-1.5">
                <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
                <span>{w}</span>
              </p>
            ))}
          </div>
        )}

        {accessToken ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setErrorMsg(null);
              placeOrder.mutate();
            }}
            className="space-y-2"
          >
            <input
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Họ và tên"
              className="focus:border-primary-500 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none"
            />
            <input
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="Số điện thoại"
              className="focus:border-primary-500 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none"
            />
            <textarea
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="Địa chỉ giao hàng"
              rows={2}
              className="focus:border-primary-500 w-full resize-none rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none"
            />
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú (không bắt buộc)"
              rows={1}
              className="focus:border-primary-500 w-full resize-none rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none"
            />
            {errorMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {errorMsg}
              </div>
            )}
            <button
              type="submit"
              disabled={disabled}
              className="bg-primary-700 hover:bg-primary-800 w-full rounded-lg py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              {placeOrder.isPending ? "Đang đặt hàng..." : "Đặt hàng (COD)"}
            </button>
          </form>
        ) : (
          <Link
            href={`/login?next=${encodeURIComponent(pathname || "/")}`}
            className="bg-primary-700 hover:bg-primary-800 block rounded-lg py-2 text-center text-sm font-medium text-white transition-colors"
          >
            Đăng nhập để đặt hàng
          </Link>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 2: Typecheck.**
  Run: `cd /home/mgriffe-work/Desktop/TTTN/goodminton-shop-ui && npx tsc --noEmit`
  Expected: PASS — exit code 0, no output. (Confirms the `ordersApi.create` payload shape, `useAuthStore` selectors, `useMutation`/`useQueries` generics, `toast`/`getErrorMessage`/`formatPrice` signatures, and the `OrderDraft` import all typecheck. `paymentMethod: "COD"` must be assignable to `PaymentMethod`.)

- [ ] **Step 3: Manual verification — component compiles standalone; behavioral proof deferred.**
  The card is not mounted yet (that is Task 3), so there is nothing to click. Confirm only that `npx tsc --noEmit` is clean and the file imports resolve (no red squiggles in the editor). Full click-through (guest gate, prefill, disable rule, place order, placed state) is verified in Task 3 Step 5, where the card is live in the chat panel.
  Expected: typecheck clean; no unresolved imports.

- [ ] **Step 4: Commit.**
  Run:
  ```
  cd /home/mgriffe-work/Desktop/TTTN/goodminton-shop-ui && git add components/chatbot/order-confirm-card.tsx && git commit -m "feat(chatbot): add OrderConfirmCard (COD checkout from order draft)

Renders the RAG order_draft (prominent size·color, prices via formatPrice),
failure-tolerant thumbnails, red warning banner + dimmed out-of-stock lines,
inline guest gate to /login?next=, prefilled COD form, and places the order via
the existing ordersApi.create with Number()-coerced ids. Placed state locks to
an Đã đặt #id link. Disabled on pending/success/warnings/empty/missing fields.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
  ```

---

### Task 3: Mount card in `MessageBubble` + durable `onPlaced` guard
**Files:**
- Modify: `components/chatbot/chat-panel.tsx` — import `OrderConfirmCard` (near line 15); add a `markPlaced` callback in `ChatPanel` (after the `send` callback, ~line 120); pass `onPlaced` where `MessageBubble` is rendered (line 185); extend `MessageBubble`'s signature + body (lines 260-293) to accept `onPlaced` and render `<OrderConfirmCard>` sibling to `<ProductSourceCards>`.
- Test: none (no test runner — verify via `npx tsc --noEmit` + the mandatory end-to-end dry run below)
**Interfaces:**
- Consumes: `OrderConfirmCard` (Task 2); `ChatMessage.order_draft` / `ChatMessage.placedOrderId` (Task 1); `setMessages` (already in `ChatPanel`).
- Produces: the fully wired feature (nothing downstream depends on it).

- [ ] **Step 1: Import `OrderConfirmCard`.**
  In `components/chatbot/chat-panel.tsx`, add after the existing `import { ChatApiError, sendChat } from "./api";` (line 13) / `import type { ChatMessage } from "./types";` (line 14) group:
  ```tsx
  import { OrderConfirmCard } from "./order-confirm-card";
  ```

- [ ] **Step 2: Add the durable `markPlaced` write guard in `ChatPanel`.**
  In `components/chatbot/chat-panel.tsx`, immediately after the `send` `useCallback` closes (after line 120, before `onKeyDown`), add:
  ```tsx
    // Durable single-write guard: stamp placedOrderId onto the message (keyed by
    // ts) exactly once. This re-persists to localStorage via the existing effect,
    // so a reload keeps the card locked to its "Đã đặt #id" state and the button
    // never re-arms. The `placedOrderId == null` check makes the write idempotent.
    const markPlaced = useCallback((ts: number, orderId: number) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.ts === ts && m.placedOrderId == null
            ? { ...m, placedOrderId: orderId }
            : m,
        ),
      );
    }, []);
  ```

- [ ] **Step 3: Pass `onPlaced` to `MessageBubble`.**
  In `components/chatbot/chat-panel.tsx`, replace the `MessageBubble` render (line 185):
  ```tsx
          messages.map((m, i) => (
            <MessageBubble
              key={m.ts ?? i}
              message={m}
              onPlaced={(orderId) => {
                if (m.ts != null) markPlaced(m.ts, orderId);
              }}
            />
          ))
  ```

- [ ] **Step 4: Extend `MessageBubble` to accept `onPlaced` and mount the card.**
  In `components/chatbot/chat-panel.tsx`, change the `MessageBubble` signature (line 260) and add the card sibling to `ProductSourceCards` (after line 290). New signature line:
  ```tsx
  function MessageBubble({
    message,
    onPlaced,
  }: Readonly<{ message: ChatMessage; onPlaced: (orderId: number) => void }>) {
  ```
  And in the returned JSX, immediately after `{productIds.length > 0 && <ProductSourceCards ids={productIds} />}` (line 290) and before the closing `</div>`:
  ```tsx
        {!isUser && message.order_draft && (
          <OrderConfirmCard
            draft={message.order_draft}
            placedOrderId={message.placedOrderId}
            onPlaced={onPlaced}
          />
        )}
  ```

- [ ] **Step 5: Typecheck.**
  Run: `cd /home/mgriffe-work/Desktop/TTTN/goodminton-shop-ui && npx tsc --noEmit`
  Expected: PASS — exit code 0, no output. (Confirms `onPlaced` is threaded with matching signatures and `message.order_draft`/`placedOrderId` are typed.)

- [ ] **Step 6: MANDATORY end-to-end dry run (the spec's #1 must-do).**
  Prereqs: RAG service running with the `prepare_order` tool live and `central_store_name` correct (`"Goodminton HQ - Di An"`); shop-api + seeded DB up; `npm run dev`.
  1. **Guest gate:** logged out, open the chatbot, send "mua 2 vợt Astrox 100ZZ size 4U màu đỏ". Observe: the card renders the line(s) with a prominent `size · color` subline, per-line `× qty · unit price`, right-aligned line total, and a grand total; a **"Đăng nhập để đặt hàng"** link appears (no form). Click it → routes to `/login?next=<current-path>`.
  2. **Logged-in prefill + place:** log in as a CUSTOMER, repeat the buy request. Observe: name + phone are **prefilled** from the account; type an address. The **"Đặt hàng (COD)"** button enables only when name+phone+address are all filled and there are no warnings. Click it once. Observe: success toast "Đặt hàng thành công!", the card flips to **"✓ Đã đặt hàng #<id>"** (a link), and the app navigates to `/orders/<id>` showing the real server-priced order.
  3. **Durable guard:** go back to the chat, **reload the page**. Observe: the same assistant message still shows **"✓ Đã đặt hàng #<id>"** — no form, no re-armed button (proves `placedOrderId` persisted to `localStorage["gm.chat-history"]`).
  4. **Warning blocks order:** trigger a draft with a warning (e.g. request a quantity above central stock so a line comes back `in_stock:false` + a warning). Observe: the warning renders in a red banner, the out-of-stock line is dimmed with a "hết hàng" tag, and the button is **disabled**.
  5. **Thumbnail tolerance:** if shop-api product-detail is unreachable, confirm the card still renders lines and remains orderable (placeholder in the thumbnail slot).
  Expected: all five observations hold; no console errors; the placed order exists in `/orders/<id>`.

- [ ] **Step 7: Commit.**
  Run:
  ```
  cd /home/mgriffe-work/Desktop/TTTN/goodminton-shop-ui && git add components/chatbot/chat-panel.tsx && git commit -m "feat(chatbot): mount OrderConfirmCard with durable placed-order guard

Render OrderConfirmCard in MessageBubble (sibling to ProductSourceCards, gated
!isUser && message.order_draft) and thread an onPlaced callback that stamps
placedOrderId onto the message by ts via setMessages — an idempotent, persisted
single-write guard so the confirm button never re-arms after reload.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
  ```
