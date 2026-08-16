/**
 * Danh sách host được phép nhúng iframe, dùng chung cho cả hai đầu.
 *
 * Trước đây chỉ có `HtmlContent` biết danh sách này, còn trình soạn thảo không
 * biết gì cả — đó đúng là kiểu lệch nhau mà việc gom vào một chỗ ngăn được:
 * thứ admin nhìn thấy trong editor và thứ khách nhận trên trang sản phẩm phải
 * được lọc bằng cùng một luật.
 */
const ALLOWED_IFRAME_HOSTS =
  /^(?:.*\.)?(?:youtube(?:-nocookie)?\.com|youtu\.be|player\.vimeo\.com)$/i;

/** URL nhúng có thuộc host cho phép không. URL hỏng coi như không. */
export function isAllowedEmbedSrc(src: string | null | undefined): boolean {
  if (!src) return false;
  try {
    return ALLOWED_IFRAME_HOSTS.test(new URL(src).hostname);
  } catch {
    return false;
  }
}

const YT_RE =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/i;
const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d+)/i;

/**
 * Đổi URL người dùng dán thành URL nhúng. Trả về null nếu không nhận diện được.
 */
export function toEmbedUrl(raw: string): string | null {
  const url = raw.trim();
  const yt = YT_RE.exec(url);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = VIMEO_RE.exec(url);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

/** Thuộc tính đặt lên iframe nhúng — khai báo một lần cho editor lẫn storefront. */
export const EMBED_IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
