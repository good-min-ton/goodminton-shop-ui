"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryImage {
  id: number;
  url: string;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  alt: string;
}

export function ProductGallery({
  images,
  alt,
}: Readonly<ProductGalleryProps>) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = images[activeIdx];

  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden rounded-2xl bg-stone-100">
        {active ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={active.url}
            alt={alt}
            className="h-full w-full object-contain p-6"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-300">
            <ImageOff size={64} />
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(idx)}
              className={cn(
                "aspect-square overflow-hidden rounded-lg border-2 bg-stone-100 transition-colors",
                idx === activeIdx
                  ? "border-primary-700"
                  : "border-transparent hover:border-stone-300",
              )}
              aria-label={`Ảnh ${idx + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={`${alt} ${idx + 1}`}
                className="h-full w-full object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
