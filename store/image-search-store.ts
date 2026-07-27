"use client";

import { create } from "zustand";
import type { ProductListItem } from "@/types/api";

type ImageSearchStatus = "idle" | "loading" | "success" | "error";

interface ImageSearchState {
  status: ImageSearchStatus;
  results: ProductListItem[];
  error: string | null;
  /** Called by the header before navigating: reset + enter loading. */
  start: () => void;
  succeed: (results: ProductListItem[]) => void;
  fail: (error: string) => void;
  reset: () => void;
}

export const useImageSearchStore = create<ImageSearchState>((set) => ({
  status: "idle",
  results: [],
  error: null,
  start: () => set({ status: "loading", results: [], error: null }),
  succeed: (results) => set({ status: "success", results, error: null }),
  fail: (error) => set({ status: "error", error, results: [] }),
  reset: () => set({ status: "idle", results: [], error: null }),
}));
