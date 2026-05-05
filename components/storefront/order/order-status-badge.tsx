import { cn } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/types/api";

interface StatusConfig {
  label: string;
  className: string;
}

const ORDER_STATUS: Record<OrderStatus, StatusConfig> = {
  PENDING: { label: "Chờ xác nhận", className: "bg-amber-50 text-amber-700" },
  CONFIRMED: { label: "Đã xác nhận", className: "bg-blue-50 text-blue-700" },
  PREPARING: {
    label: "Đang chuẩn bị",
    className: "bg-violet-50 text-violet-700",
  },
  SHIPPING: { label: "Đang giao", className: "bg-cyan-50 text-cyan-700" },
  DELIVERED: { label: "Đã giao", className: "bg-emerald-50 text-emerald-700" },
  COMPLETED: {
    label: "Hoàn thành",
    className: "bg-emerald-100 text-emerald-800",
  },
  CANCELLED: { label: "Đã huỷ", className: "bg-red-50 text-red-700" },
  RETURN_REQUESTED: {
    label: "Yêu cầu hoàn",
    className: "bg-orange-50 text-orange-700",
  },
};

const PAYMENT_STATUS: Record<PaymentStatus, StatusConfig> = {
  PENDING: { label: "Chưa thanh toán", className: "bg-amber-50 text-amber-700" },
  PAID: { label: "Đã thanh toán", className: "bg-emerald-50 text-emerald-700" },
  FAILED: { label: "Thanh toán lỗi", className: "bg-red-50 text-red-700" },
};

export function OrderStatusBadge({
  status,
  className,
}: Readonly<{ status: OrderStatus; className?: string }>) {
  const cfg = ORDER_STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        cfg.className,
        className,
      )}
    >
      {cfg.label}
    </span>
  );
}

export function PaymentStatusBadge({
  status,
  className,
}: Readonly<{ status: PaymentStatus; className?: string }>) {
  const cfg = PAYMENT_STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        cfg.className,
        className,
      )}
    >
      {cfg.label}
    </span>
  );
}
