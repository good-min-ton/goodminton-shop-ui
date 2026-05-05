import { api } from "@/lib/api";
import type { Account, Store } from "@/types/api";

export const storesApi = {
  list() {
    return api.get<Store[]>("/api/stores");
  },

  detail(id: number) {
    return api.get<Store>(`/api/stores/${id}`);
  },

  create(body: {
    adminId: number;
    name: string;
    address: string;
    contact: string;
    longitude: number;
    latitude: number;
  }) {
    return api.post<Store>("/api/stores", body);
  },

  availableAdmins() {
    return api.get<Account[]>("/api/stores/available-admins");
  },

  updateAdmin(storeId: number, adminId: number) {
    return api.patch<Store>(
      `/api/stores/${storeId}/update-admin/${adminId}`,
    );
  },

  remove(storeId: number) {
    return api.delete<void>(`/api/stores/${storeId}`);
  },
};
