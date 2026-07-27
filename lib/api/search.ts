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

const RAG_API_URL =
  process.env.NEXT_PUBLIC_RAG_API_URL?.replace(/\/$/, "") ?? "";

/** RAG /search/image response — H1 contract: ranked product ids as strings. */
export interface ImageSearchResponse {
  product_ids: string[];
}

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

  /** Visual search: POST the image to RAG /search/image (multipart field
   *  `file` — H2) and read back ranked product ids (strings — H1). Hits the
   *  RAG service directly (raw JSON, not the shop-api {code,result} envelope,
   *  mirroring components/chatbot/api.ts). */
  async searchByImage(file: File | Blob): Promise<ImageSearchResponse> {
    if (!RAG_API_URL) {
      throw new Error("Image search chưa được cấu hình.");
    }
    const fd = new FormData();
    fd.append("file", file, "upload.jpg"); // H2: field name `file`
    const res = await fetch(`${RAG_API_URL}/search/image`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      throw new Error(`Image search failed (${res.status})`);
    }
    return res.json() as Promise<ImageSearchResponse>;
  },

  /** Hydrate RAG image-search ids → list items via shop-api. Order + is_visible
   *  are enforced server-side (H8); the UI renders the array as-received. */
  listItemsByIds(ids: number[]): Promise<ProductListItem[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return api.get<ProductListItem[]>(
      `/api/products/list-items?ids=${ids.join(",")}`,
    );
  },
};
