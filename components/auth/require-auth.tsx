"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useCurrentUser } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import type { Role } from "@/types/api";

interface RequireAuthProps {
  /** When set, only users matching at least one of these roles may pass. */
  roles?: Role[];
  fallbackHref?: string;
  children: React.ReactNode;
}

export function RequireAuth({
  roles,
  fallbackHref = "/login",
  children,
}: Readonly<RequireAuthProps>) {
  const router = useRouter();
  const pathname = usePathname();

  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  useCurrentUser();

  const allowed =
    !!user && (roles === undefined || roles.length === 0 || roles.includes(user.role));

  useEffect(() => {
    if (!isHydrated) return;
    if (!accessToken) {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`${fallbackHref}?next=${next}`);
      return;
    }
    if (user && !allowed) {
      router.replace("/403");
    }
  }, [isHydrated, accessToken, user, allowed, pathname, router, fallbackHref]);

  if (!isHydrated || !accessToken || (accessToken && !user) || !allowed) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="text-primary-700" size={28} />
      </div>
    );
  }

  return <>{children}</>;
}
