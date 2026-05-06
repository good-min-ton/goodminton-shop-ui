"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[AdminError]", error);
  }, [error]);

  return (
    <div className="bg-admin-bg flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <AlertOctagon className="text-red-400" size={56} />
      <h1 className="font-display text-admin-text mt-4 text-3xl font-extrabold">
        Đã có lỗi xảy ra
      </h1>
      <p className="text-admin-text-muted mt-3 max-w-md text-sm">
        {error.message ||
          "Hệ thống gặp sự cố không mong muốn khi tải trang quản trị."}
      </p>
      {error.digest && (
        <p className="font-mono text-admin-text-muted mt-2 text-[11px]">
          Mã lỗi: {error.digest}
        </p>
      )}
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button variant="admin-primary" onClick={reset}>
          Thử lại
        </Button>
        <Link href="/admin/dashboard">
          <Button variant="admin-ghost">Về dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
