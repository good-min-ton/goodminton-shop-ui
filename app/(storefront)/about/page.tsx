import type { Metadata } from "next";
import Link from "next/link";
import { Award, Truck, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description:
    "Goodminton Shop — chuyên phân phối vợt, giày, phụ kiện cầu lông chính hãng từ Yonex, Victor, Lining và các thương hiệu hàng đầu.",
};

const HIGHLIGHTS = [
  {
    icon: Award,
    title: "Chính hãng 100%",
    body: "Toàn bộ sản phẩm phân phối trực tiếp từ nhà sản xuất hoặc đại lý uỷ quyền — kèm tem chống hàng giả và phiếu bảo hành.",
  },
  {
    icon: Truck,
    title: "Giao hàng toàn quốc",
    body: "Hợp tác với GHTK, GHN — giao 1-3 ngày tại Hà Nội, Hồ Chí Minh và 2-5 ngày ra các tỉnh khác.",
  },
  {
    icon: ShieldCheck,
    title: "Đổi trả 7 ngày",
    body: "Sản phẩm còn nguyên tag, chưa qua sử dụng được đổi trả trong 7 ngày kể từ khi nhận hàng.",
  },
  {
    icon: MapPin,
    title: "Hệ thống cửa hàng",
    body: "Cửa hàng vật lý tại các thành phố lớn — đến để cảm nhận, thử cầm vợt và được tư vấn bởi đội ngũ chơi cầu lông chuyên nghiệp.",
  },
];

export default function AboutPage() {
  return (
    <div className="container-app py-12">
      <header className="mx-auto max-w-3xl text-center">
        <p className="font-mono text-xs tracking-widest text-stone-400 uppercase">
          Về chúng tôi
        </p>
        <h1 className="font-display mt-3 text-5xl font-extrabold tracking-tight text-stone-900">
          Goodminton — đam mê và chuyên nghiệp
        </h1>
        <p className="mt-5 text-base leading-relaxed text-stone-600">
          Chúng tôi là cộng đồng những người yêu cầu lông, mong muốn mang đến
          cho khách hàng Việt Nam nguồn vợt, giày và phụ kiện chính hãng với
          giá tốt nhất, dịch vụ tận tâm và am hiểu sâu về môn thể thao này.
        </p>
      </header>

      <section className="mt-14 grid gap-4 md:grid-cols-2">
        {HIGHLIGHTS.map((h) => {
          const Icon = h.icon;
          return (
            <article
              key={h.title}
              className="rounded-2xl border border-stone-200 bg-white p-6"
            >
              <div className="bg-primary-50 text-primary-700 mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl">
                <Icon size={20} />
              </div>
              <h2 className="font-display text-xl font-extrabold tracking-tight text-stone-900">
                {h.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {h.body}
              </p>
            </article>
          );
        })}
      </section>

      <section className="mt-14 rounded-2xl bg-stone-900 p-10 text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">
            Câu chuyện của chúng tôi
          </h2>
          <p className="mt-4 leading-relaxed text-stone-300">
            Goodminton bắt đầu từ một nhóm bạn chơi cầu lông tại Hà Nội — chán
            cảnh phải săn vợt xách tay không rõ nguồn gốc, hoặc mua giá trên
            trời tại các shop nhỏ. Năm 2024, chúng tôi mở cửa hàng đầu tiên với
            cam kết: chỉ bán hàng chính hãng, giá minh bạch, ai cũng có thể thử
            cầm vợt và được tư vấn bởi người chơi thật.
          </p>
          <p className="mt-3 leading-relaxed text-stone-300">
            Đến nay, mạng lưới chi nhánh đã trải dài tại nhiều thành phố lớn,
            phục vụ hàng nghìn khách hàng yêu cầu lông trên khắp Việt Nam.
          </p>
        </div>
      </section>

      <section className="mt-14 text-center">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-stone-900">
          Bắt đầu hành trình của bạn
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-stone-500">
          Khám phá danh mục vợt, giày và phụ kiện được tuyển chọn kỹ lưỡng.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/products">
            <Button uppercase>Xem sản phẩm</Button>
          </Link>
          <Link href="/contact">
            <Button variant="secondary">Liên hệ tư vấn</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
