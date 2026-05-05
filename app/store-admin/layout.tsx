export default function StoreAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className="bg-admin-bg text-admin-text min-h-screen"
      style={{ background: "#13161f" }}
      data-theme="store-admin"
    >
      <div className="container-app py-12">{children}</div>
    </div>
  );
}
