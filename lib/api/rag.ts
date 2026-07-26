/**
 * Calls to the RAG service (FastAPI, separate host from the Spring API).
 * Uses NEXT_PUBLIC_RAG_API_URL — same base as the chatbot.
 */
const RAG_URL = process.env.NEXT_PUBLIC_RAG_API_URL?.replace(/\/$/, "") ?? "";

export interface GenerateDescriptionOptions {
  style?: "ban_hang" | "chuyen_nghiep" | "than_thien" | "seo";
  length?: "short" | "medium" | "long";
  keywords?: string[];
}

/**
 * Generate a Vietnamese product description via the RAG LLM endpoint.
 * Returns the generated text — a DRAFT for admin review; it is NOT persisted
 * by this call (the admin edits it in the form and Save writes it).
 * Requires the product to already exist (RAG fetches its attributes by id).
 */
export async function generateProductDescription(
  productId: number,
  opts: GenerateDescriptionOptions = {},
): Promise<string> {
  if (!RAG_URL) {
    throw new Error("RAG service chưa được cấu hình (NEXT_PUBLIC_RAG_API_URL).");
  }
  const res = await fetch(`${RAG_URL}/products/${productId}/description`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      style: opts.style ?? "ban_hang",
      length: opts.length ?? "long",
      keywords: opts.keywords ?? [],
    }),
  });
  if (!res.ok) {
    throw new Error(`RAG description failed: ${res.status}`);
  }
  const data = (await res.json()) as { description: string };
  return data.description;
}
