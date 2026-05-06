import type { Metadata } from "next";
import { Clock, ExternalLink, Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Liên hệ",
  description:
    "Liên hệ Goodminton Shop — hotline, email, địa chỉ cửa hàng và mạng xã hội.",
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

const STORES = [
  {
    name: "Goodminton Hà Nội",
    address: "123 Đường Cầu Giấy, Quận Cầu Giấy, Hà Nội",
    phone: "024 1234 5678",
  },
  {
    name: "Goodminton Hồ Chí Minh",
    address: "456 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh",
    phone: "028 8765 4321",
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

      <section className="mx-auto mt-12 max-w-4xl">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-stone-900">
          Hệ thống cửa hàng
        </h2>
        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {STORES.map((s) => (
            <li
              key={s.name}
              className="rounded-2xl border border-stone-200 bg-white p-5"
            >
              <h3 className="font-display text-lg font-bold tracking-tight text-stone-900">
                {s.name}
              </h3>
              <p className="mt-2 inline-flex items-start gap-2 text-sm text-stone-600">
                <MapPin
                  size={14}
                  className="mt-0.5 flex-shrink-0 text-stone-400"
                />
                <span>{s.address}</span>
              </p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm text-stone-600">
                <Phone size={14} className="text-stone-400" />
                <a href={`tel:${s.phone}`} className="hover:text-primary-700">
                  {s.phone}
                </a>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-12 max-w-2xl text-center">
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
