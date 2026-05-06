import { cn } from "@/lib/utils";

interface AdminCardProps {
  className?: string;
  children: React.ReactNode;
  padded?: boolean;
}

export function AdminCard({
  className,
  children,
  padded = true,
}: Readonly<AdminCardProps>) {
  return (
    <div
      className={cn(
        "bg-admin-surface border-admin-border rounded-xl border",
        padded && "p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}
