import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Tin tức",
  description:
    "Tin tức, mẹo chơi và đánh giá sản phẩm cầu lông từ Goodminton.",
};

export default function NewsPage() {
  return (
    <div className="container-app py-12">
      <header className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs tracking-widest text-stone-400 uppercase">
          Tin tức · Blog
        </p>
        <h1 className="font-display mt-3 text-5xl font-extrabold tracking-tight text-stone-900">
          Cập nhật từ Goodminton
        </h1>
        <p className="mt-4 text-base text-stone-500">
          Mẹo chọn vợt, kỹ thuật chơi, đánh giá sản phẩm và tin tức ngành.
        </p>
      </header>

      <div className="mx-auto mt-14 max-w-2xl">
        <EmptyState
          icon={<Newspaper size={56} />}
          title="Sắp ra mắt"
          description="Chúng tôi đang chuẩn bị các bài viết đầu tiên về kỹ thuật, hướng dẫn chọn vợt và đánh giá sản phẩm. Quay lại sau nhé!"
          action={
            <Link href="/products">
              <Button uppercase>Xem sản phẩm</Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
