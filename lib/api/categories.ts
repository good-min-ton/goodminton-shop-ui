import { api } from "@/lib/api";
import type { Category } from "@/types/api";

export const categoriesApi = {
  list() {
    return api.get<Category[]>("/api/categories");
  },

  detail(id: number) {
    return api.get<Category>(`/api/categories/${id}`);
  },

  create(body: { name: string; description?: string }) {
    return api.post<Category>("/api/categories", body);
  },

  update(id: number, body: { name: string; description?: string }) {
    return api.put<Category>(`/api/categories/${id}`, body);
  },

  remove(id: number) {
    return api.delete<void>(`/api/categories/${id}`);
  },
};
