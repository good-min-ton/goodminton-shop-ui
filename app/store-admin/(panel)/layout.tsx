import { RequireAuth } from "@/components/auth/require-auth";
import { StoreAdminSidebar } from "@/components/store-admin/sidebar";
import { StoreAdminTopbar } from "@/components/store-admin/topbar";

export default function StoreAdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RequireAuth roles={["STORE_ADMIN"]} fallbackHref="/admin/login">
      <div className="min-h-screen">
        <StoreAdminSidebar />
        <div className="lg:pl-[240px]">
          <StoreAdminTopbar />
          <main className="px-6 py-8">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
