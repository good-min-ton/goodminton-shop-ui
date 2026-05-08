"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ShoppingBag, Banknote, Building2, CreditCard } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { useAddressStore } from "@/store/address-store";
import { toast } from "@/store/toast-store";
import { ordersApi } from "@/lib/api/orders";
import { vnpayApi } from "@/lib/api/vnpay";
import { getErrorMessage } from "@/lib/error-messages";
import { formatVnd, cn } from "@/lib/utils";
import {
  checkoutSchema,
  type CheckoutInput,
} from "@/lib/validation/checkout";
import type { PaymentMethod } from "@/types/api";

export default function CheckoutPage() {
  return (
    <RequireAuth roles={["CUSTOMER"]}>
      <CheckoutContent />
    </RequireAuth>
  );
}

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: typeof Banknote;
}[] = [
  {
    value: "COD",
    label: "Thanh toán khi nhận hàng (COD)",
    description: "Trả tiền mặt cho shipper khi nhận hàng.",
    icon: Banknote,
  },
  {
    value: "BANKING",
    label: "Chuyển khoản ngân hàng",
    description: "Chuyển khoản theo thông tin shop gửi sau khi đặt.",
    icon: Building2,
  },
  {
    value: "VNPAY",
    label: "VNPay (thẻ ATM, Visa, QR)",
    description: "Thanh toán online qua cổng VNPay an toàn.",
    icon: CreditCard,
  },
];

function CheckoutContent() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clear = useCartStore((s) => s.clear);
  const user = useAuthStore((s) => s.user);
  const savedAddress = useAddressStore((s) => s.saved);
  const saveAddress = useAddressStore((s) => s.save);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      recipientName: "",
      recipientPhone: "",
      recipientAddress: "",
      recipientEmail: "",
      note: "",
      paymentMethod: "COD",
    },
  });

  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    if (savedAddress) {
      setValue("recipientName", savedAddress.recipientName);
      setValue("recipientPhone", savedAddress.recipientPhone);
      setValue("recipientAddress", savedAddress.recipientAddress);
      setValue("recipientEmail", savedAddress.recipientEmail ?? "");
      return;
    }
    if (user) {
      setValue("recipientName", user.fullName);
      setValue("recipientPhone", user.phone);
      setValue("recipientEmail", user.email);
    }
  }, [savedAddress, user, setValue]);

  const placeOrder = useMutation({
    mutationFn: async (values: CheckoutInput) => {
      const order = await ordersApi.create({
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        recipientName: values.recipientName,
        recipientPhone: values.recipientPhone,
        recipientAddress: values.recipientAddress,
        recipientEmail: values.recipientEmail || undefined,
        note: values.note || undefined,
        paymentMethod: values.paymentMethod,
      });

      saveAddress({
        recipientName: values.recipientName,
        recipientPhone: values.recipientPhone,
        recipientAddress: values.recipientAddress,
        recipientEmail: values.recipientEmail || undefined,
        note: values.note || undefined,
      });

      if (values.paymentMethod === "VNPAY") {
        const { paymentUrl } = await vnpayApi.createPaymentUrl(order.id);
        return { order, paymentUrl };
      }
      return { order, paymentUrl: null };
    },
    onSuccess: ({ order, paymentUrl }) => {
      clear();
      if (paymentUrl) {
        globalThis.location.href = paymentUrl;
      } else {
        toast("Đặt hàng thành công!", "success");
        router.replace(`/orders/${order.id}`);
      }
    },
    onError: (err) => {
      toast(getErrorMessage(err, "Đặt hàng thất bại"), "error");
    },
  });

  if (items.length === 0) {
    return (
      <div className="container-app py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-stone-300" />
        <h1 className="font-display mt-4 text-2xl font-bold text-stone-900">
          Giỏ hàng trống
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Bạn cần thêm sản phẩm vào giỏ trước khi thanh toán.
        </p>
        <Link href="/products" className="mt-6 inline-block">
          <Button uppercase>Mua sắm ngay</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <h1 className="font-display mb-8 text-4xl font-extrabold tracking-tight text-stone-900">
        Thanh toán
      </h1>

      <form
        onSubmit={handleSubmit((v) => placeOrder.mutate(v))}
        className="grid gap-8 lg:grid-cols-[1fr_380px]"
      >
        <div className="space-y-8">
          <section className="rounded-xl border border-stone-200 bg-white p-6">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-sm font-bold tracking-wider text-stone-900 uppercase">
                Thông tin giao hàng
              </h2>
              {savedAddress && (
                <SavedAddressHint
                  onReset={() => {
                    if (user) {
                      setValue("recipientName", user.fullName);
                      setValue("recipientPhone", user.phone);
                      setValue("recipientEmail", user.email);
                    } else {
                      setValue("recipientName", "");
                      setValue("recipientPhone", "");
                      setValue("recipientEmail", "");
                    }
                    setValue("recipientAddress", "");
                  }}
                />
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Họ và tên"
                required
                error={errors.recipientName?.message}
                containerClassName="sm:col-span-2"
                {...register("recipientName")}
              />
              <Input
                label="Số điện thoại"
                type="tel"
                required
                error={errors.recipientPhone?.message}
                {...register("recipientPhone")}
              />
              <Input
                label="Email"
                type="email"
                hint="Optional — dùng để gửi xác nhận đơn"
                error={errors.recipientEmail?.message}
                {...register("recipientEmail")}
              />
              <Textarea
                label="Địa chỉ giao hàng"
                required
                rows={3}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                error={errors.recipientAddress?.message}
                containerClassName="sm:col-span-2"
                {...register("recipientAddress")}
              />
              <Textarea
                label="Ghi chú"
                rows={2}
                placeholder="Ghi chú cho shipper (giờ giao, gọi trước...)"
                error={errors.note?.message}
                containerClassName="sm:col-span-2"
                {...register("note")}
              />
            </div>
          </section>

          <section className="rounded-xl border border-stone-200 bg-white p-6">
            <h2 className="font-display mb-5 text-sm font-bold tracking-wider text-stone-900 uppercase">
              Phương thức thanh toán
            </h2>
            <div className="space-y-2">
              {PAYMENT_OPTIONS.map((opt) => {
                const active = paymentMethod === opt.value;
                const Icon = opt.icon;
                return (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-colors",
                      active
                        ? "border-primary-700 bg-primary-50"
                        : "border-stone-200 bg-white hover:border-stone-300",
                    )}
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      {...register("paymentMethod")}
                      className="sr-only"
                    />
                    <Icon
                      size={20}
                      className={cn(
                        "mt-0.5 flex-shrink-0",
                        active ? "text-primary-700" : "text-stone-500",
                      )}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-stone-900">
                        {opt.label}
                      </div>
                      <div className="mt-0.5 text-xs text-stone-500">
                        {opt.description}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "mt-1 inline-block h-4 w-4 flex-shrink-0 rounded-full border-2",
                        active
                          ? "border-primary-700 bg-primary-700"
                          : "border-stone-300",
                      )}
                      aria-hidden
                    />
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="self-start rounded-xl border border-stone-200 bg-white p-6 lg:sticky lg:top-[88px]">
          <h2 className="font-display mb-4 text-sm font-bold tracking-wider text-stone-900 uppercase">
            Đơn hàng của bạn
          </h2>

          <ul className="divide-y divide-stone-100">
            {items.map((item) => {
              const price = item.salePrice ?? item.unitPrice;
              return (
                <li key={item.variantId} className="flex gap-3 py-3 first:pt-0">
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
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
                        <ShoppingBag size={20} />
                      </div>
                    )}
                    <span className="font-mono absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-stone-900 px-1 text-[10px] text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-stone-900">
                      {item.productName}
                    </p>
                    <p className="text-xs text-stone-500">
                      {item.colorName} · {item.sizeName}
                    </p>
                  </div>
                  <span className="font-mono flex-shrink-0 text-sm">
                    {formatVnd(price * item.quantity)}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 space-y-1.5 border-t border-stone-200 pt-4 text-sm">
            <div className="flex items-center justify-between text-stone-600">
              <span>Tạm tính</span>
              <span className="font-mono">{formatVnd(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-stone-600">
              <span>Phí vận chuyển</span>
              <span className="text-stone-500">Tính sau</span>
            </div>
            <div className="my-2 h-px bg-stone-200" />
            <div className="flex items-center justify-between font-medium">
              <span className="text-stone-900">Tổng cộng</span>
              <span className="font-mono text-primary-700 text-lg">
                {formatVnd(subtotal)}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            uppercase
            size="lg"
            className="mt-5 w-full"
            loading={placeOrder.isPending}
          >
            {paymentMethod === "VNPAY" ? "Thanh toán VNPay" : "Đặt hàng"}
          </Button>

          {paymentMethod === "VNPAY" && (
            <p className="mt-3 text-center text-xs text-stone-500">
              Bạn sẽ được chuyển sang trang VNPay sau khi xác nhận.
            </p>
          )}
        </aside>
      </form>
    </div>
  );
}

function SavedAddressHint({ onReset }: Readonly<{ onReset: () => void }>) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-stone-500">
      <span>Đã điền địa chỉ giao hàng gần nhất.</span>
      <button
        type="button"
        onClick={onReset}
        className="text-primary-700 font-medium hover:underline"
      >
        Nhập mới
      </button>
    </span>
  );
}
