"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Spinner } from "@/components/ui/spinner";
import type { Role } from "@/types/api";

interface RedirectIfAuthedProps {
  /** Per-role target. Falls back to `defaultRedirect` if a role is missing. */
  roleRedirect?: Partial<Record<Role, string>>;
  /** Catch-all target when no per-role mapping matches. */
  defaultRedirect?: string;
  children: React.ReactNode;
}

const ROLE_HOME: Record<Role, string> = {
  CUSTOMER: "/",
  STORE_ADMIN: "/store-admin/dashboard",
  SUPER_ADMIN: "/admin/dashboard",
};

export function RedirectIfAuthed({
  roleRedirect,
  defaultRedirect,
  children,
}: Readonly<RedirectIfAuthedProps>) {
  const router = useRouter();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);

  const target =
    isHydrated && user
      ? roleRedirect?.[user.role] ?? defaultRedirect ?? ROLE_HOME[user.role]
      : null;

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (target) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="text-primary-700" size={28} />
      </div>
    );
  }

  return <>{children}</>;
}
