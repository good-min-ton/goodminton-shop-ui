import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";

const fontDisplay = Bricolage_Grotesque({
  variable: "--font-display-family",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const fontSans = DM_Sans({
  variable: "--font-sans-family",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const fontMono = DM_Mono({
  variable: "--font-mono-family",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

const SITE_NAME = "Goodminton";
const SITE_DESCRIPTION =
  "Vợt, giày, phụ kiện cầu lông chuyên nghiệp từ các thương hiệu hàng đầu thế giới.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Vợt cầu lông chính hãng`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "cầu lông",
    "vợt cầu lông",
    "giày cầu lông",
    "Yonex",
    "Victor",
    "Lining",
    "phụ kiện cầu lông",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: "Goodminton Shop" }],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Vợt cầu lông chính hãng`,
    description: SITE_DESCRIPTION,
    images: [{ url: "/icon.png", width: 500, height: 500, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — Vợt cầu lông chính hãng`,
    description: SITE_DESCRIPTION,
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
