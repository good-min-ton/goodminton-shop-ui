"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StoreAdminError({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[StoreAdminError]", error);
  }, [error]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
      style={{ background: "#13161f" }}
    >
      <AlertOctagon className="text-red-400" size={56} />
      <h1 className="font-display text-admin-text mt-4 text-3xl font-extrabold">
        Đã có lỗi xảy ra
      </h1>
      <p className="text-admin-text-muted mt-3 max-w-md text-sm">
        {error.message ||
          "Không tải được trang. Vui lòng thử lại hoặc quay về dashboard."}
      </p>
      {error.digest && (
        <p className="font-mono text-admin-text-muted mt-2 text-[11px]">
          Mã lỗi: {error.digest}
        </p>
      )}
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button onClick={reset} className="bg-amber-400 text-stone-900 hover:bg-amber-300">
          Thử lại
        </Button>
        <Link href="/store-admin/dashboard">
          <Button variant="admin-ghost">Về dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
