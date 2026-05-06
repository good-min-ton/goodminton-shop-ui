"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Building2,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  User,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { inventoriesApi } from "@/lib/api/inventories";
import { productsApi } from "@/lib/api/products";
import { ordersApi } from "@/lib/api/orders";
import { ApiException } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import { cn, formatVnd } from "@/lib/utils";
import type { Inventory, PaymentMethod, Product, ProductVariant } from "@/types/api";

interface PosLine {
  variantId: number;
  productId: number;
  productName: string;
  skuCode: string;
  colorName: string;
  sizeName: string;
  unitPrice: number;
  salePrice: number | null;
  thumbnailUrl: string | null;
  available: number;
  quantity: number;
}

const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  icon: typeof Banknote;
}[] = [
  { value: "COD", label: "Tiền mặt", icon: Banknote },
  { value: "BANKING", label: "Chuyển khoản", icon: Building2 },
];

export default function PosPage() {
  const qc = useQueryClient();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<PosLine[]>([]);
  const [customerId, setCustomerId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");

  const inv = useQuery({
    queryKey: ["my-store-inventory", "pos"],
    queryFn: () =>
      inventoriesApi.myStore({ page: 1, size: 200, sortBy: "productName" }),
  });

  const productsQuery = useQuery({
    queryKey: ["products", "pos-prices"],
    queryFn: () => productsApi.list({ page: 1, size: 200 }),
  });

  const variantPriceMap = useMemo(() => {
    const map = new Map<
      number,
      { price: number; salePrice: number | null; thumbnailUrl: string | null }
    >();
    const products = productsQuery.data?.content ?? [];
    for (const p of products as Product[]) {
      for (const v of p.variants as ProductVariant[]) {
        map.set(v.variantId, {
          price: v.price,
          salePrice: v.salePrice,
          thumbnailUrl: p.thumbnail?.url ?? null,
        });
      }
    }
    return map;
  }, [productsQuery.data]);

  const items = useMemo(() => {
    const all = (inv.data?.content ?? []).filter((row) => row.quantity > 0);
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter(
      (row) =>
        row.productName.toLowerCase().includes(q) ||
        row.skuCode.toLowerCase().includes(q),
    );
  }, [inv.data, search]);

  function addLine(row: Inventory) {
    setLines((prev) => {
      const existing = prev.find((l) => l.variantId === row.variantId);
      if (existing) {
        if (existing.quantity >= row.quantity) {
          toast(`Chỉ còn ${row.quantity} trong kho`, "warning");
          return prev;
        }
        return prev.map((l) =>
          l.variantId === row.variantId
            ? { ...l, quantity: l.quantity + 1 }
            : l,
        );
      }
      const meta = variantPriceMap.get(row.variantId);
      return [
        ...prev,
        {
          variantId: row.variantId,
          productId: row.productId,
          productName: row.productName,
          skuCode: row.skuCode,
          colorName: row.color.name,
          sizeName: row.size.name,
          unitPrice: meta?.price ?? 0,
          salePrice: meta?.salePrice ?? null,
          thumbnailUrl: meta?.thumbnailUrl ?? null,
          available: row.quantity,
          quantity: 1,
        },
      ];
    });
  }

  function updateQty(variantId: number, delta: number) {
    setLines((prev) =>
      prev
        .map((l) => {
          if (l.variantId !== variantId) return l;
          const next = l.quantity + delta;
          if (next > l.available) {
            toast(`Chỉ còn ${l.available} trong kho`, "warning");
            return l;
          }
          return { ...l, quantity: next };
        })
        .filter((l) => l.quantity > 0),
    );
  }

  function removeLine(variantId: number) {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId));
  }

  const subtotal = useMemo(
    () =>
      lines.reduce((sum, l) => {
        const price = l.salePrice ?? l.unitPrice;
        return sum + price * l.quantity;
      }, 0),
    [lines],
  );

  const create = useMutation({
    mutationFn: () => {
      const customerIdNum = Number(customerId);
      if (!Number.isFinite(customerIdNum) || customerIdNum <= 0) {
        throw new Error("Vui lòng nhập Customer ID hợp lệ");
      }
      if (lines.length === 0) {
        throw new Error("Vui lòng thêm sản phẩm");
      }
      return ordersApi.createInStore({
        customerId: customerIdNum,
        items: lines.map((l) => ({
          variantId: l.variantId,
          quantity: l.quantity,
        })),
        paymentMethod,
      });
    },
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ["store-orders"] });
      qc.invalidateQueries({ queryKey: ["my-store-inventory"] });
      toast(`Đã tạo đơn #${order.orderId}`, "success");
      setLines([]);
      setCustomerId("");
      router.push(`/store-admin/orders/${order.orderId}`);
    },
    onError: (err) => {
      if (err instanceof ApiException) {
        toast(getErrorMessage(err.code, err.message), "error");
      } else if (err instanceof Error) {
        toast(err.message, "warning");
      }
    },
  });

  return (
    <>
      <AdminPageHeader
        title="Bán hàng tại quầy"
        description="Tạo đơn IN_STORE, hệ thống tự deduct kho và đánh dấu đã thanh toán."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        <AdminCard padded={false}>
          <div className="border-admin-border border-b p-4">
            <div className="relative">
              <Search
                size={16}
                className="text-admin-text-muted absolute top-1/2 left-3 -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Tìm theo tên sản phẩm hoặc SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-admin-surface-2 text-admin-text border-admin-border placeholder:text-admin-text-muted focus:border-amber-400 w-full rounded-lg border py-2 pr-3 pl-9 text-sm outline-none"
                autoFocus
              />
            </div>
          </div>

          <PosInventoryGrid
            items={items}
            loading={inv.isLoading || productsQuery.isLoading}
            priceMap={variantPriceMap}
            onAdd={addLine}
          />
        </AdminCard>

        <aside className="space-y-3 lg:sticky lg:top-[88px] lg:self-start">
          <AdminCard>
            <h2 className="font-display text-admin-text-muted mb-3 text-[11px] font-bold tracking-widest uppercase">
              <User size={12} className="mr-1.5 inline" />
              Khách hàng
            </h2>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Customer ID"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value.replace(/\D/g, ""))}
              className="bg-admin-surface-2 text-admin-text border-admin-border placeholder:text-admin-text-muted focus:border-amber-400 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            />
            <p className="text-admin-text-muted mt-1.5 text-[11px]">
              Nhập ID account của khách (backend chưa hỗ trợ search theo SĐT/email).
            </p>
          </AdminCard>

          <AdminCard padded={false}>
            <h2 className="font-display text-admin-text-muted border-admin-border border-b px-4 py-3 text-[11px] font-bold tracking-widest uppercase">
              <ShoppingBag size={12} className="mr-1.5 inline" />
              Đơn ({lines.length})
            </h2>

            <PosCart lines={lines} onUpdate={updateQty} onRemove={removeLine} />

            {lines.length > 0 && (
              <div className="border-admin-border border-t p-4">
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="text-admin-text-muted text-sm">
                    Tổng cộng
                  </span>
                  <span className="font-mono text-lg font-medium text-amber-300">
                    {formatVnd(subtotal)}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-admin-text-muted mb-1.5 text-[11px] uppercase tracking-wider">
                    Thanh toán
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map((m) => {
                      const active = paymentMethod === m.value;
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.value}
                          onClick={() => setPaymentMethod(m.value)}
                          className={cn(
                            "flex items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2 text-xs transition-colors",
                            active
                              ? "border-amber-400 bg-amber-400/10 text-amber-300"
                              : "border-admin-border text-admin-text-muted hover:border-admin-text-muted",
                          )}
                        >
                          <Icon size={14} />
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button
                  uppercase
                  className="w-full"
                  size="lg"
                  loading={create.isPending}
                  onClick={() => create.mutate()}
                >
                  Tạo đơn hàng
                </Button>
              </div>
            )}
          </AdminCard>
        </aside>
      </div>
    </>
  );
}

interface PosInventoryGridProps {
  items: Inventory[];
  loading: boolean;
  priceMap: Map<
    number,
    { price: number; salePrice: number | null; thumbnailUrl: string | null }
  >;
  onAdd: (row: Inventory) => void;
}

function PosInventoryGrid({
  items,
  loading,
  priceMap,
  onAdd,
}: Readonly<PosInventoryGridProps>) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="text-amber-300" size={28} />
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="text-admin-text-muted py-16 text-center text-sm">
        Không tìm thấy sản phẩm phù hợp.
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 xl:grid-cols-4">
      {items.map((row) => {
        const meta = priceMap.get(row.variantId);
        const display = meta?.salePrice ?? meta?.price ?? 0;
        return (
          <li key={row.inventoryId}>
            <button
              onClick={() => onAdd(row)}
              className="bg-admin-surface-2 hover:border-amber-400 border-admin-border group flex w-full flex-col overflow-hidden rounded-lg border-2 text-left transition-colors"
            >
              <div className="bg-admin-bg flex aspect-square items-center justify-center">
                {meta?.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={meta.thumbnailUrl}
                    alt={row.productName}
                    className="h-full w-full object-contain p-2"
                    loading="lazy"
                  />
                ) : (
                  <ShoppingBag size={28} className="text-admin-text-muted" />
                )}
              </div>
              <div className="p-2.5">
                <p className="text-admin-text line-clamp-2 text-xs font-medium">
                  {row.productName}
                </p>
                <p className="text-admin-text-muted mt-0.5 text-[10px]">
                  {row.color.name} · {row.size.name}
                </p>
                <div className="mt-1.5 flex items-baseline justify-between">
                  <span className="font-mono text-amber-300 text-xs">
                    {formatVnd(display)}
                  </span>
                  <span className="font-mono text-admin-text-muted text-[10px]">
                    {row.quantity} còn
                  </span>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

interface PosCartProps {
  lines: PosLine[];
  onUpdate: (variantId: number, delta: number) => void;
  onRemove: (variantId: number) => void;
}

function PosCart({ lines, onUpdate, onRemove }: Readonly<PosCartProps>) {
  if (lines.length === 0) {
    return (
      <div className="text-admin-text-muted px-4 py-10 text-center text-sm">
        <ShoppingBag size={28} className="mx-auto mb-2 opacity-40" />
        Chưa có sản phẩm. Click sản phẩm bên trái để thêm.
      </div>
    );
  }
  return (
    <ul className="divide-admin-border divide-y">
      {lines.map((l) => {
        const price = l.salePrice ?? l.unitPrice;
        return (
          <li key={l.variantId} className="flex gap-2 p-3 text-sm">
            <div className="min-w-0 flex-1">
              <p className="text-admin-text line-clamp-1 font-medium">
                {l.productName}
              </p>
              <p className="text-admin-text-muted text-[11px]">
                {l.colorName} · {l.sizeName}
              </p>
              <div className="mt-1.5 flex items-center justify-between">
                <div className="bg-admin-surface-2 inline-flex items-center rounded-md">
                  <button
                    onClick={() => onUpdate(l.variantId, -1)}
                    className="text-admin-text-muted hover:text-admin-text p-1.5"
                    aria-label="Giảm"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="font-mono w-8 text-center text-xs">
                    {l.quantity}
                  </span>
                  <button
                    onClick={() => onUpdate(l.variantId, 1)}
                    className="text-admin-text-muted hover:text-admin-text p-1.5"
                    aria-label="Tăng"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <span className="font-mono text-amber-300 text-xs">
                  {formatVnd(price * l.quantity)}
                </span>
              </div>
            </div>
            <button
              onClick={() => onRemove(l.variantId)}
              className="text-admin-text-muted self-start rounded-md p-1 hover:bg-red-500/10 hover:text-red-400"
              aria-label="Xoá"
            >
              <Trash2 size={12} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
