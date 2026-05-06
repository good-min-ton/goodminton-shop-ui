"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="bg-soft-glow flex min-h-[70vh] flex-col items-center justify-center bg-stone-50 px-4 text-center">
      <AlertOctagon className="text-red-500" size={56} />
      <h1 className="font-display mt-4 text-4xl font-extrabold text-stone-900">
        Đã có lỗi xảy ra
      </h1>
      <p className="mt-3 max-w-md text-sm text-stone-500">
        {error.message ||
          "Hệ thống gặp sự cố không mong muốn. Vui lòng thử lại hoặc quay về trang chủ."}
      </p>
      {error.digest && (
        <p className="font-mono mt-2 text-[11px] text-stone-400">
          Mã lỗi: {error.digest}
        </p>
      )}
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button uppercase onClick={reset}>
          Thử lại
        </Button>
        <Link href="/">
          <Button variant="secondary">Về trang chủ</Button>
        </Link>
      </div>
    </div>
  );
}
