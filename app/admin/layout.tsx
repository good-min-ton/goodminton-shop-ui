export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className="bg-admin-bg text-admin-text bg-soft-glow-dark min-h-screen"
      data-theme="admin"
    >
      <div className="container-app py-12">{children}</div>
    </div>
  );
}
