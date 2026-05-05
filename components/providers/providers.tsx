"use client";

import { QueryProvider } from "./query-provider";
import { AuthHydrator } from "./auth-hydrator";
import { ToastViewport } from "@/components/ui/toast";

export function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <QueryProvider>
      <AuthHydrator />
      {children}
      <ToastViewport />
    </QueryProvider>
  );
}
