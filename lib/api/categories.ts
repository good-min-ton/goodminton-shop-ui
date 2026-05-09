import { api } from "@/lib/api";
import type { Category } from "@/types/api";

export interface CategoryWriteBody {
  name: string;
  description?: string;
}

export const categoriesApi = {
  list() {
    return api.get<Category[]>("/api/categories");
  },

  detail(id: number) {
    return api.get<Category>(`/api/categories/${id}`);
  },

  create(body: CategoryWriteBody, thumbnail?: File | null) {
    const fd = new FormData();
    fd.append(
      "categoryInfo",
      new Blob([JSON.stringify(body)], { type: "application/json" }),
    );
    if (thumbnail) fd.append("thumbnail", thumbnail);
    return api.upload<Category>("/api/categories", fd);
  },

  update(id: number, body: CategoryWriteBody, thumbnail?: File | null) {
    const fd = new FormData();
    fd.append(
      "categoryInfo",
      new Blob([JSON.stringify(body)], { type: "application/json" }),
    );
    if (thumbnail) fd.append("thumbnail", thumbnail);
    return api.upload<Category>(`/api/categories/${id}`, fd, { method: "PUT" });
  },

  remove(id: number) {
    return api.delete<void>(`/api/categories/${id}`);
  },
};
