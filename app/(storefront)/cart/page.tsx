"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatVnd } from "@/lib/utils";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const totalItems = useCartStore((s) => s.totalItems());
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);

  if (items.length === 0) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon={<ShoppingBag size={64} />}
          title="Giỏ hàng đang trống"
          description="Khám phá các sản phẩm vợt, giày và phụ kiện cầu lông chính hãng."
          action={
            <Link href="/products">
              <Button uppercase>Mua sắm ngay</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <div className="mb-8">
        <h1 className="font-display text-stone-900 text-4xl font-extrabold tracking-tight">
          Giỏ hàng
        </h1>
        <p className="mt-2 text-sm text-stone-500">{totalItems} sản phẩm</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <ul className="divide-y divide-stone-100">
            {items.map((item) => {
              const price = item.salePrice ?? item.unitPrice;
              const lineTotal = price * item.quantity;
              return (
                <li key={item.variantId} className="flex gap-4 p-5">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="block aspect-square w-24 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100"
                  >
                    {item.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnailUrl}
                        alt={item.productName}
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-stone-300">
                        <ShoppingBag size={28} />
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="font-medium text-stone-900 hover:text-primary-700"
                    >
                      {item.productName}
                    </Link>
                    <p className="mt-1 text-sm text-stone-500">
                      {item.colorName} · {item.sizeName}
                    </p>
                    <p className="font-mono mt-0.5 text-xs text-stone-400">
                      SKU: {item.skuCode}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center overflow-hidden rounded-lg border border-stone-200">
                        <button
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity - 1)
                          }
                          className="p-2 text-stone-600 hover:bg-stone-50"
                          aria-label="Giảm"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-mono w-10 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity + 1)
                          }
                          className="p-2 text-stone-600 hover:bg-stone-50"
                          aria-label="Tăng"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-primary-700 text-base font-medium">
                          {formatVnd(lineTotal)}
                        </span>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="rounded-md p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Xoá"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex justify-end border-t border-stone-100 bg-stone-50 px-5 py-3">
            <button
              onClick={clear}
              className="text-sm text-stone-500 hover:text-red-600"
            >
              Xoá toàn bộ giỏ hàng
            </button>
          </div>
        </div>

        <aside className="self-start rounded-xl border border-stone-200 bg-white p-5 lg:sticky lg:top-[88px]">
          <h2 className="font-display text-lg font-bold tracking-tight text-stone-900">
            Tổng đơn hàng
          </h2>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-stone-600">Tạm tính</dt>
              <dd className="font-mono">{formatVnd(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-stone-600">Phí vận chuyển</dt>
              <dd className="text-stone-500">Tính khi thanh toán</dd>
            </div>
            <div className="my-2 h-px bg-stone-200" />
            <div className="flex items-center justify-between">
              <dt className="font-medium text-stone-900">Tổng cộng</dt>
              <dd className="font-mono text-primary-700 text-lg font-medium">
                {formatVnd(subtotal)}
              </dd>
            </div>
          </dl>

          <Link href="/checkout" className="mt-5 block">
            <Button uppercase size="lg" className="w-full">
              Tiến hành thanh toán
            </Button>
          </Link>
          <Link href="/products" className="mt-2 block">
            <Button variant="ghost" size="sm" className="w-full">
              Tiếp tục mua sắm
            </Button>
          </Link>
        </aside>
      </div>
    </div>
  );
}
