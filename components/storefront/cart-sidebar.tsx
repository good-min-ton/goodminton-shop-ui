"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/utils";

export function CartSidebar() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[100] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Giỏ hàng"
    >
      <button
        className="absolute inset-0 cursor-default bg-stone-900/40 backdrop-blur-sm"
        onClick={close}
        aria-label="Đóng giỏ hàng"
      />

      <aside className="animate-slide-in-right relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="font-display text-xl font-bold tracking-tight text-stone-900">
            Giỏ hàng ({items.length})
          </h2>
          <button
            onClick={close}
            className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <ShoppingBag size={48} className="text-stone-300" />
              <p className="font-display mt-4 text-xl font-bold text-stone-900">
                Giỏ hàng trống
              </p>
              <p className="mt-2 text-sm text-stone-500">
                Khám phá sản phẩm và thêm vào giỏ để bắt đầu mua sắm.
              </p>
              <Link href="/products" onClick={close} className="mt-6">
                <Button variant="secondary">Xem sản phẩm</Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {items.map((item) => {
                const price = item.salePrice ?? item.unitPrice;
                return (
                  <li key={item.variantId} className="flex gap-3 p-4">
                    <Link
                      href={`/products/${item.productSlug}`}
                      onClick={close}
                      className="block aspect-square w-20 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100"
                    >
                      {item.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnailUrl}
                          alt={item.productName}
                          className="h-full w-full object-contain p-1.5"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-stone-300">
                          <ShoppingBag size={24} />
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.productSlug}`}
                        onClick={close}
                        className="line-clamp-2 text-sm font-medium text-stone-900 hover:text-primary-700"
                      >
                        {item.productName}
                      </Link>
                      <p className="mt-1 text-xs text-stone-500">
                        {item.colorName} · {item.sizeName}
                      </p>
                      <p className="font-mono text-primary-700 mt-1 text-sm font-medium">
                        {formatVnd(price)}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center overflow-hidden rounded-md border border-stone-200">
                          <button
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity - 1)
                            }
                            className="p-1.5 text-stone-600 hover:bg-stone-50"
                            aria-label="Giảm"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-mono w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity + 1)
                            }
                            className="p-1.5 text-stone-600 hover:bg-stone-50"
                            aria-label="Tăng"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="rounded-md p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Xoá"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-stone-200 bg-stone-50 px-5 py-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-stone-600">
                <span>Tạm tính</span>
                <span className="font-mono">{formatVnd(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>Phí vận chuyển</span>
                <span>Tính khi thanh toán</span>
              </div>
              <div className="my-2 h-px bg-stone-200" />
              <div className="flex items-center justify-between font-medium text-stone-900">
                <span>Tổng cộng</span>
                <span className="font-mono text-lg">{formatVnd(subtotal)}</span>
              </div>
            </div>

            <Link href="/checkout" onClick={close} className="mt-4 block">
              <Button uppercase className="w-full" size="lg">
                Tiến hành thanh toán
              </Button>
            </Link>
            <Link href="/cart" onClick={close} className="mt-2 block">
              <Button variant="ghost" className="w-full" size="sm">
                Xem giỏ hàng đầy đủ
              </Button>
            </Link>
          </footer>
        )}
      </aside>
    </div>
  );
}
