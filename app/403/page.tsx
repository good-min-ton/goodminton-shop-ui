import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="bg-racket-grid flex min-h-[70vh] flex-col items-center justify-center bg-stone-50 px-4 text-center">
      <p className="font-mono text-sm tracking-widest text-stone-400 uppercase">
        403 — Forbidden
      </p>
      <h1 className="font-display mt-4 text-5xl font-extrabold text-stone-900">
        Bạn không có quyền truy cập
      </h1>
      <p className="mt-3 max-w-md text-stone-500">
        Trang này yêu cầu quyền cao hơn. Hãy đăng nhập bằng tài khoản phù hợp
        hoặc quay lại trang chủ.
      </p>
      <Link href="/" className="mt-8 inline-block">
        <Button uppercase>Về trang chủ</Button>
      </Link>
    </div>
  );
}
