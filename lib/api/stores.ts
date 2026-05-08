import { api } from "@/lib/api";
import type { Account, Store } from "@/types/api";

export interface StoreWriteBody {
  adminId: number;
  name: string;
  address: string;
  contact: string;
  longitude: number;
  latitude: number;
  /** `null` = không đổi (chỉ áp dụng khi PUT). `true`/`false` = set state. */
  isCentral?: boolean | null;
}

export const storesApi = {
  list() {
    return api.get<Store[]>("/api/stores");
  },

  detail(id: number) {
    return api.get<Store>(`/api/stores/${id}`);
  },

  create(body: StoreWriteBody) {
    return api.post<Store>("/api/stores", body);
  },

  update(storeId: number, body: StoreWriteBody) {
    return api.put<Store>(`/api/stores/${storeId}`, body);
  },

  availableAdmins() {
    return api.get<Account[]>("/api/stores/available-admins");
  },

  remove(storeId: number) {
    return api.delete<void>(`/api/stores/${storeId}`);
  },
};
