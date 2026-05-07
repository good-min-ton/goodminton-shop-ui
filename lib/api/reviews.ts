import { api, buildQuery } from "@/lib/api";
import type { PageQuery, PageResponse, Review } from "@/types/api";

export const reviewsApi = {
  list(productId: number, query: PageQuery = {}) {
    return api.get<PageResponse<Review>>(
      `/api/reviews/${productId}${buildQuery(query)}`,
    );
  },

  create(
    productId: number,
    body: { orderItemId: number; rating: number; comment: string },
  ) {
    return api.post<Review>(`/api/reviews/${productId}`, body);
  },
};
