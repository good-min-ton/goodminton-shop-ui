import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-soft-glow flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 text-center">
      <p className="font-mono text-sm tracking-widest text-stone-400 uppercase">
        404 — Not Found
      </p>
      <h1 className="font-display mt-4 text-6xl font-extrabold text-stone-900">
        Trang không tồn tại
      </h1>
      <p className="mt-3 max-w-md text-stone-500">
        Có vẻ trang bạn tìm đã không còn ở đây. Quả cầu đã bay đi hướng khác rồi 🏸
      </p>
      <Link href="/" className="mt-8 inline-block">
        <Button uppercase>Về trang chủ</Button>
      </Link>
    </div>
  );
}
