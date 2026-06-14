import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const priceFormatter = new Intl.NumberFormat("vi-VN");

export function formatPrice(value: number | string | null | undefined): string {
  if (value == null || value === "") return "0";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "0";
  return priceFormatter.format(Math.round(n));
}

export function formatVnd(value: number | string | null | undefined): string {
  return `${formatPrice(value)}đ`;
}

const dateFmt = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFmt = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return dateFmt.format(d);
}

export function formatDateTime(
  value: string | Date | null | undefined,
): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return dateTimeFmt.format(d);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Inject a Cloudinary transformation segment into an `/image/upload/` URL.
 * Returns the original URL untouched if it isn't a Cloudinary upload URL —
 * safe to use as a blanket helper across all thumbnail render paths.
 *
 * @example
 *   cldThumb(url, 96)            // 96x96 square, auto format + quality
 *   cldThumb(url, 96, { fit: "contain" }) // contain instead of fill
 */
export function cldThumb(
  url: string | null | undefined,
  size: number,
  opts: { fit?: "fill" | "contain" } = {},
): string | null {
  if (!url) return null;
  const marker = "/image/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  const crop = opts.fit === "contain" ? "c_fit" : "c_fill";
  const transform = `${crop},w_${size},h_${size},q_auto,f_auto`;
  return `${url.slice(0, idx + marker.length)}${transform}/${url.slice(idx + marker.length)}`;
}
