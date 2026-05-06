export default function StoreAdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className="text-admin-text min-h-screen"
      style={{ background: "#13161f" }}
      data-theme="store-admin"
    >
      {children}
    </div>
  );
}
