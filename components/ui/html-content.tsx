"use client";

import { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";

interface HtmlContentProps {
  html: string;
  className?: string;
}

const ALLOWED_IFRAME_HOSTS = /^(?:.*\.)?(?:youtube(?:-nocookie)?\.com|youtu\.be|player\.vimeo\.com)$/i;

let hookAttached = false;
function ensureIframeHook() {
  if (hookAttached) return;
  hookAttached = true;
  DOMPurify.addHook("uponSanitizeElement", (node, data) => {
    if (data.tagName !== "iframe") return;
    const el = node as Element;
    const src = el.getAttribute("src") ?? "";
    try {
      const host = new URL(src).hostname;
      if (!ALLOWED_IFRAME_HOSTS.test(host)) {
        el.remove();
      }
    } catch {
      el.remove();
    }
  });
}

/**
 * Render trusted-but-author-supplied HTML safely.
 * Sanitizes via DOMPurify; allows images, links, lists, and iframes
 * from YouTube / Vimeo hosts only.
 */
export function HtmlContent({ html, className }: Readonly<HtmlContentProps>) {
  const sanitized = useMemo(() => {
    ensureIframeHook();
    return DOMPurify.sanitize(html, {
      // iframe restricted to YouTube/Vimeo via uponSanitizeElement hook
      // eslint-disable-next-line sonarjs/dompurify-domain-prevention
      ADD_TAGS: ["iframe"],
      ADD_ATTR: [
        "allow",
        "allowfullscreen",
        "frameborder",
        "scrolling",
        "target",
        "rel",
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|data:image\/):|\/|#)/i,
      FORBID_TAGS: ["script", "style", "form", "input", "object", "embed"],
      FORBID_ATTR: ["onerror", "onclick", "onload", "onmouseover"],
    });
  }, [html]);

  return (
    <div
      className={cn("rich-text", className)}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
