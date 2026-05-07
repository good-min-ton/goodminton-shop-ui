"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner";
import type { Store } from "@/types/api";

const Inner = dynamic(() => import("./stores-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[480px] items-center justify-center rounded-2xl border border-stone-200 bg-stone-50">
      <Spinner className="text-primary-700" size={28} />
    </div>
  ),
});

interface StoresMapProps {
  stores: Store[];
  activeStoreId: number | null;
  onMarkerClick?: (storeId: number) => void;
  height?: number | string;
}

export function StoresMap(props: Readonly<StoresMapProps>) {
  return <Inner {...props} />;
}
