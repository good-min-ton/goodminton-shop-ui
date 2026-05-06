import { formatDate } from "@/lib/utils";

export function StoreAdminTopbar() {
  return (
    <header
      className="border-admin-border sticky top-0 z-20 flex h-[60px] items-center justify-between border-b px-6 backdrop-blur-sm"
      style={{ background: "rgba(19, 22, 31, 0.85)" }}
    >
      <div>
        <p className="text-admin-text-muted text-xs">Hôm nay</p>
        <p className="text-admin-text font-mono text-sm">
          {formatDate(new Date())}
        </p>
      </div>
    </header>
  );
}
