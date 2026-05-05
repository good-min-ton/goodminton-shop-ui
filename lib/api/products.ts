import { api, buildQuery } from "@/lib/api";
import type {
  PageQuery,
  PageResponse,
  Product,
  RecommendedProduct,
  ResourceImage,
  Review,
} from "@/types/api";

export const productsApi = {
  list(query: PageQuery = {}) {
    return api.get<PageResponse<Product>>(`/api/products${buildQuery(query)}`);
  },

  detail(productId: number) {
    return api.get<Product>(`/api/products/${productId}`);
  },

  recommendations(productId: number) {
    return api.get<RecommendedProduct[]>(
      `/api/products/${productId}/recommendations`,
    );
  },

  reviews(productId: number, query: PageQuery = {}) {
    return api.get<PageResponse<Review>>(
      `/api/products/${productId}/reviews${buildQuery(query)}`,
    );
  },

  createReview(
    productId: number,
    body: { orderItemId: number; rating: number; comment: string },
  ) {
    return api.post<Review>(`/api/products/${productId}/reviews`, body);
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

  uploadVariantImage(variantId: number, file: File) {
    const fd = new FormData();
    fd.append("file", file);
    return api.upload<ResourceImage>(
      `/api/products/variants/${variantId}/images`,
      fd,
    );
  },

  removeVariantImage(imageId: number) {
    return api.delete<void>(`/api/products/variants/images/${imageId}`);
  },
};
