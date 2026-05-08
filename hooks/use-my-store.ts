"use client";

import { useQuery } from "@tanstack/react-query";
import { storesApi } from "@/lib/api/stores";
import { useAuthStore } from "@/store/auth-store";

/**
 * Resolve the Store currently managed by the logged-in STORE_ADMIN.
 *
 * Backend has no `/api/stores/my-store` endpoint, so we filter the public
 * stores list by `admin.id === currentUser.id`. Cached 5 min — store ↔ admin
 * mapping changes rarely (only via super-admin reassign).
 */
export function useMyStore() {
  const me = useAuthStore((s) => s.user);
  const myId = me?.id ?? null;

  const query = useQuery({
    queryKey: ["stores", "public-list"],
    queryFn: () => storesApi.list(),
    staleTime: 5 * 60 * 1000,
    enabled: myId != null,
  });

  const store = (query.data ?? []).find((s) => s.admin?.id === myId) ?? null;

  return {
    ...query,
    store,
    storeId: store?.id ?? null,
  };
}
