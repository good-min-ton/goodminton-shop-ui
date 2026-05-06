"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface RecentlyViewedItem {
  productId: number;
  slug: string;
  name: string;
  brandName: string;
  thumbnailUrl: string | null;
  /** Lowest current price (sale or regular) at time of viewing — display only. */
  displayPrice: number;
  viewedAt: number;
}

const MAX_ITEMS = 8;

interface RecentlyViewedState {
  items: RecentlyViewedItem[];
  track: (item: Omit<RecentlyViewedItem, "viewedAt">) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      track: (incoming) =>
        set((s) => {
          const next: RecentlyViewedItem = {
            ...incoming,
            viewedAt: Date.now(),
          };
          const others = s.items.filter(
            (i) => i.productId !== incoming.productId,
          );
          return { items: [next, ...others].slice(0, MAX_ITEMS) };
        }),
      clear: () => set({ items: [] }),
    }),
    {
      name: "gm.recently-viewed",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
