import { api, buildQuery } from "@/lib/api";
import type { Inventory, PageQuery, PageResponse } from "@/types/api";

export const inventoriesApi = {
  set(body: { storeId: number; variantId: number; quantity: number }) {
    return api.put<Inventory>("/api/inventories", body);
  },

  detail(inventoryId: number) {
    return api.get<Inventory>(`/api/inventories/${inventoryId}`);
  },

  byStore(storeId: number, query: PageQuery = {}) {
    return api.get<PageResponse<Inventory>>(
      `/api/inventories/stores/${storeId}${buildQuery(query)}`,
    );
  },

  myStore(query: PageQuery = {}) {
    return api.get<PageResponse<Inventory>>(
      `/api/inventories/my-store${buildQuery(query)}`,
    );
  },
};
