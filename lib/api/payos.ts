import { api } from "@/lib/api";
import type { PayOSCreateUrlResponse } from "@/types/api";

/**
 * sessionStorage key used to bridge our internal orderId from checkout to
 * `/payment/result`. PayOS's `orderCode` query param is a distinct number
 * with no resolver endpoint on the backend yet, so we stash the id ourselves.
 */
export const PAYOS_ORDER_ID_KEY = "gm.payos-pending-order-id";

export const payosApi = {
  /**
   * Create a PayOS payment link for an existing order and receive the hosted
   * checkout URL to redirect the browser to.
   */
  createPaymentUrl(orderId: number) {
    return api.post<PayOSCreateUrlResponse>("/api/payos/create-payment-url", {
      orderId,
    });
  },
};
