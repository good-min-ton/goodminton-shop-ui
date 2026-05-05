"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/types/api";

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  open: () => void;
  close: () => void;
  toggle: () => void;

  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  removeItem: (variantId: number) => void;
  clear: () => void;

  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (incoming) => {
        set((s) => {
          const existing = s.items.find(
            (i) => i.variantId === incoming.variantId,
          );
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.variantId === incoming.variantId
                  ? { ...i, quantity: i.quantity + incoming.quantity }
                  : i,
              ),
            };
          }
          return { items: [...s.items, incoming] };
        });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i,
          ),
        }));
      },

      removeItem: (variantId) =>
        set((s) => ({
          items: s.items.filter((i) => i.variantId !== variantId),
        })),

      clear: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => {
          const price = i.salePrice ?? i.unitPrice;
          return sum + price * i.quantity;
        }, 0),
    }),
    {
      name: "gm.cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
    },
  ),
);
