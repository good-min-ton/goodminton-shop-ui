import Link from "next/link";
import { Logo } from "./logo";

const COLUMNS = [
  {
    heading: "Mua sắm",
    links: [
      { href: "/products?categoryId=1", label: "Vợt cầu lông" },
      { href: "/products?categoryId=2", label: "Giày" },
      { href: "/products?categoryId=3", label: "Áo cầu lông" },
      { href: "/products?categoryId=4", label: "Phụ kiện" },
    ],
  },
  {
    heading: "Hỗ trợ",
    links: [
      { href: "/orders", label: "Đơn hàng của tôi" },
      { href: "/account", label: "Tài khoản" },
      { href: "/forgot-password", label: "Quên mật khẩu" },
    ],
  },
  {
    heading: "Goodminton",
    links: [
      { href: "/", label: "Về chúng tôi" },
      { href: "/", label: "Hệ thống cửa hàng" },
      { href: "/", label: "Chính sách đổi trả" },
    ],
  },
];

export function StorefrontFooter() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-stone-900 text-stone-300">
      <div className="container-app grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo size="lg" variant="card" />
          <p className="mt-4 max-w-xs text-sm text-stone-400">
            Vợt, giày, phụ kiện cầu lông chính hãng từ Yonex, Victor, Lining và
            các thương hiệu hàng đầu.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <h3 className="font-display text-sm font-bold tracking-wider text-white uppercase">
              {col.heading}
            </h3>
            <ul className="mt-4 space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-stone-800">
        <div className="container-app flex flex-col items-start justify-between gap-2 py-6 text-xs text-stone-500 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Goodminton Shop. All rights reserved.</p>
          <p>Made for badminton community</p>
        </div>
      </div>
    </footer>
  );
}
