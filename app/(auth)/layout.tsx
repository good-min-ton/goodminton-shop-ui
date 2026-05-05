import { Logo } from "@/components/storefront/logo";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-racket-grid flex min-h-screen flex-col bg-stone-50">
      <header className="container-app flex h-[72px] items-center">
        <Logo size="md" />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
