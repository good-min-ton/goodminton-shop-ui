"use client";

import { create } from "zustand";

interface AdminShellState {
  drawerOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useAdminShellStore = create<AdminShellState>((set) => ({
  drawerOpen: false,
  open: () => set({ drawerOpen: true }),
  close: () => set({ drawerOpen: false }),
  toggle: () => set((s) => ({ drawerOpen: !s.drawerOpen })),
}));
