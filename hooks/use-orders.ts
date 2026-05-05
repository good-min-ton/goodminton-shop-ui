"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ordersApi } from "@/lib/api/orders";
import { toast } from "@/store/toast-store";
import { ApiException } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-messages";
import type { PageQuery } from "@/types/api";

export function useMyOrders(query: PageQuery = {}) {
  return useQuery({
    queryKey: ["orders", "my", query],
    queryFn: () => ordersApi.myOrders(query),
  });
}

export function useMyOrder(orderId: number | null) {
  return useQuery({
    queryKey: ["orders", "my", "detail", orderId],
    queryFn: () => ordersApi.myOrderDetail(orderId as number),
    enabled: orderId != null,
  });
}

export function useCancelMyOrder(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => ordersApi.cancelMyOrder(orderId),
    onSuccess: () => {
      toast("Đã huỷ đơn hàng", "success");
      qc.invalidateQueries({ queryKey: ["orders", "my"] });
    },
    onError: (err) => {
      const code = err instanceof ApiException ? err.code : null;
      toast(getErrorMessage(code, "Không huỷ được đơn hàng"), "error");
    },
  });
}

export function useConfirmReceived(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => ordersApi.confirmReceived(orderId),
    onSuccess: () => {
      toast("Cảm ơn bạn đã xác nhận nhận hàng!", "success");
      qc.invalidateQueries({ queryKey: ["orders", "my"] });
    },
    onError: (err) => {
      const code = err instanceof ApiException ? err.code : null;
      toast(getErrorMessage(code), "error");
    },
  });
}
