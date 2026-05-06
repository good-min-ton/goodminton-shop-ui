"use client";

import { useEffect } from "react";

export default function GlobalErrorBoundary({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[GlobalErrorBoundary]", error);
  }, [error]);

  return (
    <html lang="vi">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
          background: "#fafaf9",
          color: "#1c1917",
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
          Hệ thống gặp lỗi nghiêm trọng
        </h1>
        <p style={{ marginTop: "0.75rem", color: "#78716c", maxWidth: 480 }}>
          {error.message ||
            "Không thể tải ứng dụng. Vui lòng tải lại trình duyệt."}
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "1.5rem",
            background: "#377aa4",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Tải lại
        </button>
      </body>
    </html>
  );
}
