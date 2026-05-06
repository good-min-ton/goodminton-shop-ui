import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  trend?: number;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  hint,
  trend,
  loading,
}: Readonly<StatCardProps>) {
  return (
    <div className="bg-admin-surface border-admin-border relative overflow-hidden rounded-xl border px-5 py-4">
      <div
        className="absolute top-0 right-0 h-16 w-16"
        style={{
          background:
            "linear-gradient(135deg, transparent 50%, rgba(95, 169, 211, 0.06) 50%)",
        }}
        aria-hidden
      />

      <div className="font-display text-admin-text-muted mb-2 text-[11px] font-bold tracking-widest uppercase">
        {label}
      </div>
      <div className="font-display text-admin-text text-3xl leading-none font-extrabold">
        {loading ? <span className="opacity-40">···</span> : value}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-xs">
        {trend != null && (
          <span
            className={cn(
              "font-medium",
              trend > 0
                ? "text-emerald-400"
                : trend < 0
                  ? "text-red-400"
                  : "text-admin-text-muted",
            )}
          >
            {trend > 0 ? "↑" : trend < 0 ? "↓" : "—"} {Math.abs(trend)}%
          </span>
        )}
        {hint && <span className="text-admin-text-muted">{hint}</span>}
      </div>
    </div>
  );
}
