import { api, buildQuery } from "@/lib/api";
import type {
  PageQuery,
  PageResponse,
  Product,
  ProductListItem,
  ResourceImage,
} from "@/types/api";

export const productsApi = {
  list(query: PageQuery = {}) {
    return api.get<PageResponse<Product>>(`/api/products${buildQuery(query)}`);
  },

  detail(productId: number) {
    return api.get<Product>(`/api/products/${productId}`);
  },

  recommendations(productId: number) {
    return api.get<ProductListItem[]>(
      `/api/products/${productId}/recommendations`,
    );
  },

  create(productInfo: object, thumbnail?: File | null) {
    const fd = new FormData();
    fd.append(
      "productInfo",
      new Blob([JSON.stringify(productInfo)], { type: "application/json" }),
    );
    if (thumbnail) fd.append("productThumbnail", thumbnail);
    return api.upload<Product>("/api/products", fd);
  },

  update(productId: number, productInfo: object, thumbnail?: File | null) {
    const fd = new FormData();
    fd.append(
      "productInfo",
      new Blob([JSON.stringify(productInfo)], { type: "application/json" }),
    );
    if (thumbnail) fd.append("productThumbnail", thumbnail);
    return api.upload<Product>(`/api/products/${productId}`, fd, {
      method: "PUT",
    });
  },

  remove(productId: number) {
    return api.delete<void>(`/api/products/${productId}`);
  },

  /** Append an image to a product's gallery (backend assigns next sortOrder). */
  uploadImage(productId: number, file: File) {
    const fd = new FormData();
    fd.append("file", file);
    return api.upload<ResourceImage>(`/api/products/${productId}/images`, fd);
  },

  removeImage(imageId: number) {
    return api.delete<void>(`/api/products/images/${imageId}`);
  },
};
