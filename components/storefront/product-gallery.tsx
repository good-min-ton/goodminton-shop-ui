"use client";

import Image from "next/image";
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
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100">
        {active ? (
          <Image
            src={active.url}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="object-contain p-6"
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
                "relative aspect-square overflow-hidden rounded-lg border-2 bg-stone-100 transition-colors",
                idx === activeIdx
                  ? "border-primary-700"
                  : "border-transparent hover:border-stone-300",
              )}
              aria-label={`Ảnh ${idx + 1}`}
            >
              <Image
                src={img.url}
                alt={`${alt} ${idx + 1}`}
                fill
                sizes="120px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
