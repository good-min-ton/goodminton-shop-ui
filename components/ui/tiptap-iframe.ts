import { Node, mergeAttributes } from "@tiptap/react";
import { EMBED_IFRAME_ALLOW, isAllowedEmbedSrc } from "@/lib/embed";

/**
 * Node `iframe` cho TipTap.
 *
 * ProseMirror chỉ giữ được node có trong schema. StarterKit không có iframe,
 * nên nút "Chèn video" trước đây đưa vào một thẻ mà schema lập tức vứt bỏ —
 * bấm nút xong chỉ còn lại đoạn văn rỗng. Ba chỗ khác vẫn phục vụ tính năng
 * không tồn tại đó: dòng chú thích cuối editor, hook allow-list YouTube/Vimeo
 * trong `HtmlContent`, và CSS `.rich-text iframe` với tỉ lệ 16:9.
 *
 * `atom` vì video là một khối không có nội dung con để soạn thảo bên trong.
 */
export const Iframe = Node.create({
  name: "iframe",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      allow: { default: EMBED_IFRAME_ALLOW },
      allowfullscreen: { default: true },
    };
  },

  parseHTML() {
    return [
      {
        tag: "iframe[src]",
        // Lọc ngay tại lúc phân tích, bằng đúng danh sách host mà HtmlContent
        // dùng. Nhờ vậy iframe dán từ nơi khác không thể nằm trong tài liệu:
        // editor không bao giờ hiện thứ mà storefront sẽ gỡ đi.
        getAttrs: (el) =>
          isAllowedEmbedSrc((el as HTMLElement).getAttribute("src"))
            ? null
            : false,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["iframe", mergeAttributes(HTMLAttributes)];
  },
});
