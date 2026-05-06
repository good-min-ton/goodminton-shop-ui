"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WishlistItem {
  productId: number;
  slug: string;
  name: string;
  brandName: string;
  thumbnailUrl: string | null;
  displayPrice: number;
  addedAt: number;
}

interface WishlistState {
  items: WishlistItem[];
  toggle: (item: Omit<WishlistItem, "addedAt">) => void;
  remove: (productId: number) => void;
  clear: () => void;
  has: (productId: number) => boolean;
  count: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (incoming) =>
        set((s) => {
          const exists = s.items.some(
            (i) => i.productId === incoming.productId,
          );
          if (exists) {
            return {
              items: s.items.filter((i) => i.productId !== incoming.productId),
            };
          }
          return {
            items: [{ ...incoming, addedAt: Date.now() }, ...s.items],
          };
        }),
      remove: (productId) =>
        set((s) => ({
          items: s.items.filter((i) => i.productId !== productId),
        })),
      clear: () => set({ items: [] }),
      has: (productId) => get().items.some((i) => i.productId === productId),
      count: () => get().items.length,
    }),
    {
      name: "gm.wishlist",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
