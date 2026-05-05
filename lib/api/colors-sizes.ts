import { api } from "@/lib/api";
import type { Color, SizeOption, SizeType } from "@/types/api";

export const colorsApi = {
  list() {
    return api.get<Color[]>("/api/colors");
  },
  detail(id: number) {
    return api.get<Color>(`/api/colors/${id}`);
  },
  create(body: { name: string }) {
    return api.post<Color>("/api/colors", body);
  },
  update(id: number, body: { name: string }) {
    return api.put<Color>(`/api/colors/${id}`, body);
  },
  remove(id: number) {
    return api.delete<void>(`/api/colors/${id}`);
  },
};

export const sizesApi = {
  list() {
    return api.get<SizeOption[]>("/api/sizes");
  },
  detail(id: number) {
    return api.get<SizeOption>(`/api/sizes/${id}`);
  },
  create(body: { name: string; type: SizeType }) {
    return api.post<SizeOption>("/api/sizes", body);
  },
  update(id: number, body: { name: string; type: SizeType }) {
    return api.put<SizeOption>(`/api/sizes/${id}`, body);
  },
  remove(id: number) {
    return api.delete<void>(`/api/sizes/${id}`);
  },
};
