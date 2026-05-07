"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const Inner = dynamic(() => import("./location-picker-inner"), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (coords: { latitude: number; longitude: number }) => void;
  height?: number;
  admin?: boolean;
}

export function LocationPicker(props: Readonly<LocationPickerProps>) {
  return <Inner {...props} />;
}

function LoadingSkeleton() {
  return (
    <div
      className={cn(
        "flex h-[420px] items-center justify-center rounded-xl border",
        "border-stone-200 bg-stone-50",
      )}
    >
      <Spinner className="text-primary-700" size={28} />
    </div>
  );
}
