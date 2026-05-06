import { RequireAuth } from "@/components/auth/require-auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

export default function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RequireAuth roles={["SUPER_ADMIN"]} fallbackHref="/admin/login">
      <div className="bg-soft-glow-dark min-h-screen">
        <AdminSidebar />
        <div className="lg:pl-[260px]">
          <AdminTopbar />
          <main className="px-6 py-8">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
