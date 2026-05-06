import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  ExternalLink,
  HelpCircle,
  Mail,
  Phone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Liên hệ",
  description:
    "Liên hệ Goodminton Shop — hotline, email, các kênh hỗ trợ và câu hỏi thường gặp.",
};

const CHANNELS = [
  {
    icon: Phone,
    label: "Hotline",
    value: "1900 5454 12",
    href: "tel:1900545412",
  },
  {
    icon: Mail,
    label: "Email",
    value: "support@goodminton.vn",
    href: "mailto:support@goodminton.vn",
  },
  {
    icon: Clock,
    label: "Giờ làm việc",
    value: "8:00 — 21:00 (T2 — CN)",
    href: null,
  },
];

const FAQ = [
  {
    q: "Đơn hàng được giao trong bao lâu?",
    a: "Tại Hà Nội và TP. Hồ Chí Minh: 1-2 ngày làm việc. Các tỉnh khác: 2-5 ngày tuỳ khu vực. Bạn sẽ nhận được mã vận đơn để tra cứu khi đơn được chuyển sang trạng thái Đang giao.",
  },
  {
    q: "Tôi có thể đổi trả sản phẩm không?",
    a: "Có. Sản phẩm còn nguyên tag, hộp và phụ kiện đi kèm được đổi trả miễn phí trong 7 ngày kể từ ngày nhận hàng. Vợt đã đan dây hoặc đã sử dụng không thuộc diện đổi trả.",
  },
  {
    q: "Vợt mới mua có cần đan dây ngay không?",
    a: "Không bắt buộc. Vợt mới thường có dây căng sẵn ở mức cơ bản (~22 lbs). Nếu bạn muốn căng theo cân riêng (24-28 lbs cho người chơi nâng cao), shop hỗ trợ dịch vụ đan dây tại cửa hàng.",
  },
  {
    q: "Có hỗ trợ thanh toán trả góp không?",
    a: "Hiện tại Goodminton hỗ trợ COD, chuyển khoản và VNPay (thẻ ATM, Visa, QR). Trả góp qua thẻ tín dụng đang được triển khai trong giai đoạn tới.",
  },
  {
    q: "Bảo hành sản phẩm thế nào?",
    a: "Vợt: 6 tháng cho lỗi nhà sản xuất (gãy khung, vỡ joint). Giày: 3 tháng cho lỗi keo và đường may. Phụ kiện: tuỳ thương hiệu, thường 1 tháng. Lỗi do người dùng (đập vợt, va chạm mạnh) không thuộc bảo hành.",
  },
  {
    q: "Làm sao biết vợt phù hợp với mình?",
    a: "Liên hệ hotline hoặc đến trực tiếp cửa hàng — đội ngũ tư vấn (đều là người chơi cầu lông thật) sẽ hỏi về trình độ, lối chơi và sức cổ tay để gợi ý vợt phù hợp. Bạn cũng có thể cầm thử vợt mẫu trước khi quyết định.",
  },
];

const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com" },
  { label: "Instagram", href: "https://instagram.com" },
  { label: "TikTok", href: "https://tiktok.com" },
  { label: "Zalo OA", href: "https://zalo.me" },
];

export default function ContactPage() {
  return (
    <div className="container-app py-12">
      <header className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs tracking-widest text-stone-400 uppercase">
          Liên hệ
        </p>
        <h1 className="font-display mt-3 text-5xl font-extrabold tracking-tight text-stone-900">
          Cần hỗ trợ? Chúng tôi luôn sẵn sàng
        </h1>
        <p className="mt-4 text-base text-stone-500">
          Mọi câu hỏi về sản phẩm, đơn hàng hoặc tư vấn chuyên môn — liên hệ
          chúng tôi qua các kênh dưới đây.
        </p>
      </header>

      <section className="mx-auto mt-14 grid max-w-4xl gap-4 md:grid-cols-3">
        {CHANNELS.map((c) => {
          const Icon = c.icon;
          const inner = (
            <article className="h-full rounded-2xl border border-stone-200 bg-white p-6 text-center transition-shadow hover:shadow-md">
              <div className="bg-primary-50 text-primary-700 mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl">
                <Icon size={20} />
              </div>
              <p className="font-mono text-[11px] tracking-widest text-stone-400 uppercase">
                {c.label}
              </p>
              <p className="mt-1.5 font-medium text-stone-900">{c.value}</p>
            </article>
          );
          return c.href ? (
            <a key={c.label} href={c.href}>
              {inner}
            </a>
          ) : (
            <div key={c.label}>{inner}</div>
          );
        })}
      </section>

      <section className="mx-auto mt-14 max-w-3xl">
        <div className="mb-6 flex items-center gap-2">
          <HelpCircle size={20} className="text-primary-700" />
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-stone-900">
            Câu hỏi thường gặp
          </h2>
        </div>
        <ul className="space-y-2">
          {FAQ.map((item, idx) => (
            <li
              key={item.q}
              className="overflow-hidden rounded-xl border border-stone-200 bg-white"
            >
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-50">
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-stone-400 text-xs">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span>{item.q}</span>
                  </span>
                  <span className="text-primary-700 flex-shrink-0 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="border-t border-stone-100 bg-stone-50 px-5 py-4 text-sm leading-relaxed text-stone-600">
                  {item.a}
                </p>
              </details>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-2xl border border-primary-200 bg-primary-50/60 p-5 text-center">
          <p className="text-sm text-stone-700">
            Không tìm thấy câu trả lời?{" "}
            <a
              href="tel:1900545412"
              className="text-primary-700 font-medium hover:underline"
            >
              Gọi hotline
            </a>{" "}
            hoặc{" "}
            <Link
              href="/stores"
              className="text-primary-700 inline-flex items-center gap-1 font-medium hover:underline"
            >
              <span>ghé cửa hàng</span>
              <ArrowRight size={12} />
            </Link>{" "}
            để được tư vấn trực tiếp.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-2xl text-center">
        <h2 className="font-display text-xl font-bold tracking-tight text-stone-900">
          Theo dõi chúng tôi
        </h2>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-700 hover:bg-primary-50 hover:border-primary-300 inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium transition-colors"
            >
              <span>{s.label}</span>
              <ExternalLink size={12} />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
