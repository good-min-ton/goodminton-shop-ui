export default function StorefrontLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-full flex-col bg-bg">
      <main className="flex-1">{children}</main>
    </div>
  );
}
