import { RequireAuth } from "@/components/auth/require-auth";

export default function StoreAdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RequireAuth roles={["STORE_ADMIN"]} fallbackHref="/admin/login">
      <div className="container-app py-12">{children}</div>
    </RequireAuth>
  );
}
