import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <section className="bg-racket-grid relative min-h-[88vh] overflow-hidden bg-stone-50">
      <div className="absolute top-0 right-0 hidden h-full w-[55%] md:block"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary-700) 0%, var(--color-primary-900) 100%)",
          clipPath: "polygon(12% 0%, 100% 0%, 100% 100%, 0% 100%)",
        }}
      />

      <div className="container-app relative grid items-center gap-12 py-24 md:grid-cols-2">
        <div className="stagger-1">
          <Badge variant="primary" className="mb-6">
            <span className="bg-primary-500 inline-block h-2 w-2 rounded-full" />
            Vợt chính hãng — Giao hàng toàn quốc
          </Badge>

          <h1 className="font-display text-stone-900 mb-6 text-6xl font-extrabold leading-[0.95] tracking-tight md:text-7xl">
            CHƠI CẦU<br />
            LÔNG NHƯ<br />
            <span className="text-primary-700">PRO.</span>
          </h1>

          <p className="mb-10 max-w-md text-lg font-light text-stone-500">
            Vợt, giày, phụ kiện cầu lông chuyên nghiệp từ các thương hiệu hàng đầu
            thế giới.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/products">
              <Button size="lg" uppercase>
                Mua ngay
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="secondary">
                Xem catalogue →
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap gap-8">
            {[
              { value: "500+", label: "Sản phẩm" },
              { value: "12K+", label: "Khách hàng" },
              { value: "5", label: "Chi nhánh" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-primary-700 text-3xl font-extrabold">
                  {s.value}
                </div>
                <div className="text-sm text-stone-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:block">
          <div className="text-stone-300/40 font-display text-[140px] leading-none font-extrabold tracking-tighter text-right">
            🏸
          </div>
        </div>
      </div>

      <div className="container-app relative py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
          Phase 1 · Foundation ready · Phase 2 incoming
        </p>
      </div>
    </section>
  );
}
