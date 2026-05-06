import type { Metadata } from "next";
import { Logo } from "@/components/storefront/logo";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-soft-glow flex min-h-screen flex-col bg-stone-50">
      <header className="container-app flex h-[72px] items-center">
        <Logo size="md" />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
