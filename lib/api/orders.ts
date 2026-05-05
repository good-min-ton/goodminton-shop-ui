import { api, buildQuery } from "@/lib/api";
import type {
  CreateInStoreOrderRequest,
  CreateOrderRequest,
  Order,
  OrderStatus,
  OrderType,
  PageQuery,
  PageResponse,
} from "@/types/api";

export const ordersApi = {
  // ===== Customer =====
  create(body: CreateOrderRequest) {
    return api.post<Order>("/api/orders", body);
  },

  myOrders(query: PageQuery = {}) {
    return api.get<PageResponse<Order>>(`/api/orders/my${buildQuery(query)}`);
  },

  myOrderDetail(orderId: number) {
    return api.get<Order>(`/api/orders/my/${orderId}`);
  },

  cancelMyOrder(orderId: number) {
    return api.post<Order>(`/api/orders/my/${orderId}/cancel`);
  },

  confirmReceived(orderId: number) {
    return api.post<Order>(`/api/orders/my/${orderId}/confirm-received`);
  },

  // ===== Store admin =====
  createInStore(body: CreateInStoreOrderRequest) {
    return api.post<Order>("/api/orders/in-store", body);
  },

  storeOrders(query: PageQuery = {}) {
    return api.get<PageResponse<Order>>(
      `/api/orders/store${buildQuery(query)}`,
    );
  },

  markPreparing(orderId: number) {
    return api.post<Order>(`/api/orders/${orderId}/preparing`);
  },

  markShipping(orderId: number, shippingCode: string) {
    return api.post<Order>(`/api/orders/${orderId}/shipping`, {
      shippingCode,
    });
  },

  markDelivered(orderId: number) {
    return api.post<Order>(`/api/orders/${orderId}/delivered`);
  },

  // ===== Super admin =====
  list(query: PageQuery & { status?: OrderStatus; type?: OrderType } = {}) {
    return api.get<PageResponse<Order>>(`/api/orders${buildQuery(query)}`);
  },

  detail(orderId: number) {
    return api.get<Order>(`/api/orders/${orderId}`);
  },

  confirm(orderId: number) {
    return api.post<Order>(`/api/orders/${orderId}/confirm`);
  },
};
