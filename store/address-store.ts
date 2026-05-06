"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface SavedAddress {
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientEmail?: string;
  note?: string;
  savedAt: number;
}

interface AddressState {
  saved: SavedAddress | null;
  save: (a: Omit<SavedAddress, "savedAt">) => void;
  clear: () => void;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      saved: null,
      save: (a) =>
        set({
          saved: { ...a, savedAt: Date.now() },
        }),
      clear: () => set({ saved: null }),
    }),
    {
      name: "gm.last-address",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
