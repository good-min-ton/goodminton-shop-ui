import { api, buildQuery } from "@/lib/api";
import type {
  Account,
  Brand,
  Category,
  PageMeta,
  PageResponse,
  ProductListItem,
  Store,
} from "@/types/api";

export interface SearchPageQuery {
  q: string;
  /** 1-based on FE; converted to 0-based for backend search service. */
  page?: number;
  size?: number;
}

/**
 * Spring `Page<T>` JSON serialization (classic, flat metadata) — distinct from
 * the PagedModel shape used by the regular list endpoints.
 */
interface ClassicPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

function toPageResponse<T>(p: ClassicPage<T>): PageResponse<T> {
  const meta: PageMeta = {
    number: p.number,
    size: p.size,
    totalElements: p.totalElements,
    totalPages: p.totalPages,
  };
  return { content: p.content, page: meta };
}

function searchQuery({ q, page = 1, size = 20 }: SearchPageQuery): string {
  return buildQuery({ q, page: page - 1, size });
}

async function searchPaged<T>(path: string, query: SearchPageQuery) {
  const res = await api.get<ClassicPage<T>>(`${path}${searchQuery(query)}`);
  return toPageResponse(res);
}

export const searchApi = {
  products(query: SearchPageQuery) {
    return searchPaged<ProductListItem>("/api/search/products", query);
  },

  /** Autocomplete — max 8 items, no pagination. */
  productsSuggest(q: string) {
    return api.get<ProductListItem[]>(
      `/api/search/products/suggest${buildQuery({ q })}`,
    );
  },

  categories(query: SearchPageQuery) {
    return searchPaged<Category>("/api/search/categories", query);
  },

  brands(query: SearchPageQuery) {
    return searchPaged<Brand>("/api/search/brands", query);
  },

  accounts(query: SearchPageQuery) {
    return searchPaged<Account>("/api/search/accounts", query);
  },

  stores(query: SearchPageQuery) {
    return searchPaged<Store>("/api/search/stores", query);
  },
};
