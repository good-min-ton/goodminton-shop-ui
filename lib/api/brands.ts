import { api } from "@/lib/api";
import type { Brand } from "@/types/api";

export const brandsApi = {
  list() {
    return api.get<Brand[]>("/api/brands");
  },

  detail(id: number) {
    return api.get<Brand>(`/api/brands/${id}`);
  },

  create(body: { name: string }) {
    return api.post<Brand>("/api/brands", body);
  },

  update(id: number, body: { name: string }) {
    return api.put<Brand>(`/api/brands/${id}`, body);
  },

  remove(id: number) {
    return api.delete<void>(`/api/brands/${id}`);
  },
};
