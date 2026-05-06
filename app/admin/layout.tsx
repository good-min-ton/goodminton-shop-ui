export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className="bg-admin-bg text-admin-text min-h-screen"
      data-theme="admin"
    >
      {children}
    </div>
  );
}
