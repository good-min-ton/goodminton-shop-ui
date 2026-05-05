import { api, buildQuery } from "@/lib/api";
import type {
  Account,
  AccountStatus,
  PageResponse,
  PageQuery,
  RegisterRequest,
  Role,
} from "@/types/api";

export const accountsApi = {
  myInfo() {
    return api.get<Account>("/api/accounts/my-info");
  },

  updateMyInfo(body: { fullName?: string; phone?: string }) {
    return api.put<Account>("/api/accounts/my-info", body);
  },

  changePassword(oldPassword: string, newPassword: string) {
    return api.patch<void>("/api/accounts/change-password", {
      oldPassword,
      newPassword,
    });
  },

  list(query: PageQuery & { role?: Role } = {}) {
    return api.get<PageResponse<Account>>(
      `/api/accounts${buildQuery(query)}`,
    );
  },

  detail(id: number) {
    return api.get<Account>(`/api/accounts/${id}`);
  },

  createStoreAdmin(body: RegisterRequest) {
    return api.post<Account>("/api/accounts/store-admin", body);
  },

  setStatus(accountId: number, status: AccountStatus) {
    return api.patch<Account>(
      `/api/accounts/${accountId}/status/${status}`,
    );
  },
};
