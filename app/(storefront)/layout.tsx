import { StorefrontHeader } from "@/components/storefront/header";
import { StorefrontFooter } from "@/components/storefront/footer";
import { CartSidebar } from "@/components/storefront/cart-sidebar";
import { StorefrontAuthGuard } from "@/components/auth/storefront-guard";

export default function StorefrontLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <StorefrontAuthGuard />
      <StorefrontHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <StorefrontFooter />
      <CartSidebar />
    </div>
  );
}
