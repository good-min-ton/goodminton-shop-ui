import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductThumbnailProps {
  src: string | null | undefined;
  alt: string;
  /** Use `fill` mode (parent must have relative + sized container). */
  fill?: boolean;
  /** Used when not in fill mode. */
  width?: number;
  height?: number;
  /** `sizes` hint for responsive srcset. */
  sizes?: string;
  /** Mark as priority (LCP candidate). */
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  fallbackIconSize?: number;
}

export function ProductThumbnail({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  className,
  imgClassName,
  fallbackIconSize = 32,
}: Readonly<ProductThumbnailProps>) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-stone-100 text-stone-300",
          className,
        )}
      >
        <ImageOff size={fallbackIconSize} />
      </div>
    );
  }

  if (fill) {
    return (
      <div className={cn("relative", className)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? "(min-width: 768px) 25vw, 50vw"}
          priority={priority}
          className={cn("object-contain", imgClassName)}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <Image
        src={src}
        alt={alt}
        width={width ?? 200}
        height={height ?? 200}
        sizes={sizes}
        priority={priority}
        className={cn("h-auto w-auto object-contain", imgClassName)}
      />
    </div>
  );
}
