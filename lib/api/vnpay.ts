import { api } from "@/lib/api";
import type { VNPayCreateUrlResponse } from "@/types/api";

export const vnpayApi = {
  createPaymentUrl(orderId: number) {
    return api.post<VNPayCreateUrlResponse>("/api/vnpay/create-payment-url", {
      orderId,
    });
  },
};
