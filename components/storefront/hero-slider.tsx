"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SLIDES = Array.from({ length: 7 }, (_, i) => ({
  src: `/hero/slide-${i + 1}.png`,
  alt: `Goodminton hero ${i + 1}`,
}));

const AUTO_ADVANCE_MS = 6000;
const SWIPE_THRESHOLD_PX = 50;

export function HeroSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  const next = useCallback(
    () => setActive((i) => (i + 1) % SLIDES.length),
    [],
  );
  const prev = useCallback(
    () => setActive((i) => (i - 1 + SLIDES.length) % SLIDES.length),
    [],
  );

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, AUTO_ADVANCE_MS);
    return () => clearInterval(t);
  }, [paused, next]);

  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > SWIPE_THRESHOLD_PX) {
      if (dx < 0) next();
      else prev();
    }
    touchStart.current = null;
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Bộ sưu tập nổi bật"
      className="group relative w-full overflow-hidden bg-stone-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative aspect-[16/9] w-full sm:aspect-[5/2] lg:aspect-[3/1]">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {SLIDES.map((s, i) => (
            <div key={s.src} className="relative h-full w-full flex-shrink-0">
              <Image
                src={s.src}
                alt={s.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent"
        />
      </div>

      <button
        type="button"
        onClick={prev}
        aria-label="Slide trước"
        className="absolute top-1/2 left-4 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-stone-700 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-white hover:text-primary-700 md:flex md:opacity-0 md:group-hover:opacity-100"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Slide kế tiếp"
        className="absolute top-1/2 right-4 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-stone-700 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-white hover:text-primary-700 md:flex md:opacity-0 md:group-hover:opacity-100"
      >
        <ChevronRight size={22} />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 md:bottom-6 md:gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Đi tới slide ${i + 1}`}
            aria-current={active === i}
            className={cn(
              "h-1.5 rounded-full bg-white/60 transition-all duration-300",
              active === i
                ? "w-7 bg-white shadow-sm md:w-8"
                : "w-1.5 hover:bg-white/90",
            )}
          />
        ))}
      </div>
    </section>
  );
}
