"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

export interface SliderImage {
  url: string;
  alt?: string | null;
}

interface Props {
  images: SliderImage[];
  /** Otomatik geçiş; kullanıcı slider'la etkileşime girdiğinde kalıcı olarak durur. */
  autoplay?: boolean;
  autoplayMs?: number;
  /** Tıklayınca tam görseli büyüten katman. */
  lightbox?: boolean;
  /** Küçük boyutlarda oklar kalabalık yaptığı için kapatılabilir. */
  showArrows?: boolean;
  className?: string;
  /**
   * Şeridin (track) oranı — tek bir görselin değil. perView=2 iken şerit iki
   * görsel yan yana durduğu için iki kat geniş olmalı: 3:4 kareler → 3:2 şerit.
   */
  aspectClassName?: string;
  /** İlk görsel LCP adayıysa true; liste içinde kullanılıyorsa false bırakın. */
  priority?: boolean;
  /** next/image sizes — küçük slider'da gereksiz büyük dosya indirilmemesi için. */
  sizes?: string;
  /** Aynı anda kaç görsel görünsün. Gezinme sayfa sayfa yapılır. */
  perView?: 1 | 2;
}

/**
 * Yeniden kullanılabilir görsel slider'ı.
 *
 * Kaydırma native `scroll-snap` ile yapılır: dokunmatik swipe, ivme ve
 * erişilebilir klavye kaydırması tarayıcıdan hazır gelir; JS yalnızca
 * ok tuşları, göstergeler ve autoplay için devreye girer. Bu sayede
 * ek bir carousel kütüphanesi gerekmiyor.
 */
export function ImageSlider({
  images,
  autoplay = false,
  autoplayMs = 5000,
  lightbox = true,
  showArrows = true,
  className = "",
  aspectClassName = "aspect-[4/3] sm:aspect-[3/2] lg:aspect-[16/9]",
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 800px",
  perView = 1,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const [zoomed, setZoomed] = useState<number | null>(null);

  const count = images.length;
  // perView > 1 iken bir "sayfa" birden fazla görsel gösterir; ok, nokta ve
  // autoplay hep sayfa adımıyla çalışır, yoksa yarım kaydırmalar oluşur.
  const pages = Math.max(1, Math.ceil(count / perView));
  // Çok sayfada nokta sırası taşacağı için ince bir ilerleme çubuğuna geçilir.
  const useDots = pages <= 8;

  const scrollTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = (i + pages) % pages;
    track.scrollTo({ left: track.clientWidth * clamped, behavior: "smooth" });
  }, [pages]);

  // Kaydırma konumundan aktif görseli türet (swipe ve ok tuşları için tek kaynak).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (track.clientWidth === 0) return;
        setIndex(Math.round(track.scrollLeft / track.clientWidth));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Autoplay: kullanıcı dokunduktan sonra bir daha başlamaz; hareket azaltma
  // tercihi açıksa ve sekme arkadaysa hiç çalışmaz.
  useEffect(() => {
    if (!autoplay || interacted || pages < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      if (document.hidden) return;
      setIndex((cur) => {
        const next = (cur + 1) % pages;
        const track = trackRef.current;
        if (track) track.scrollTo({ left: track.clientWidth * next, behavior: "smooth" });
        return next;
      });
    }, autoplayMs);
    return () => clearInterval(timer);
  }, [autoplay, autoplayMs, interacted, pages]);

  // Büyütme katmanında klavye gezinmesi.
  useEffect(() => {
    if (zoomed === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(null);
      if (e.key === "ArrowRight") setZoomed((z) => (z === null ? null : (z + 1) % count));
      if (e.key === "ArrowLeft") setZoomed((z) => (z === null ? null : (z - 1 + count) % count));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed, count]);

  if (count === 0) return null;

  function stopAutoplay() {
    if (!interacted) setInteracted(true);
  }

  return (
    <>
      <div
        className={className}
        onPointerDown={stopAutoplay}
        onMouseEnter={stopAutoplay}
        role="group"
        aria-roledescription="carousel"
        aria-label="Fotoğraflar"
      >
        {/* Oklar yalnızca görsel alanına göre konumlanmalı, göstergeler hariç. */}
        <div className="relative">
        <div
          ref={trackRef}
          className={`flex ${aspectClassName} w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth motion-reduce:scroll-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
          tabIndex={0}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className={`h-full shrink-0 ${
                perView === 2 ? "w-1/2 snap-start pr-2 last:pr-0" : "w-full snap-center"
              }`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${count}`}
            >
              <div className="relative h-full w-full overflow-hidden bg-[var(--bg-muted)]">
                <Image
                  src={img.url}
                  alt={img.alt?.trim() || `Fotoğraf ${i + 1}`}
                  fill
                  sizes={sizes}
                  className={`object-cover ${lightbox ? "cursor-zoom-in" : ""}`}
                  priority={priority && i === 0}
                  loading={priority && i === 0 ? undefined : "lazy"}
                  onClick={lightbox ? () => setZoomed(i) : undefined}
                />
              </div>
            </div>
          ))}
        </div>

        {pages > 1 && showArrows && (
          <>
            <SliderArrow
              side="left"
              onClick={() => { stopAutoplay(); scrollTo(index - 1); }}
            />
            <SliderArrow
              side="right"
              onClick={() => { stopAutoplay(); scrollTo(index + 1); }}
            />
          </>
        )}
        </div>

        {pages > 1 && (
          <>
            <div className="mt-4 flex items-center justify-center gap-2">
              {useDots ? (
                Array.from({ length: pages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { stopAutoplay(); scrollTo(i); }}
                    aria-label={`${i + 1}. sayfaya git`}
                    aria-current={i === index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === index
                        ? "w-6 bg-[var(--text-primary)]"
                        : "w-1.5 bg-[var(--text-primary)]/25 hover:bg-[var(--text-primary)]/50"
                    }`}
                  />
                ))
              ) : (
                <>
                  <div className="h-[3px] w-32 overflow-hidden rounded-full bg-[var(--text-primary)]/15">
                    <div
                      className="h-full rounded-full bg-[var(--text-primary)] transition-transform duration-300"
                      style={{
                        width: `${100 / pages}%`,
                        transform: `translateX(${index * 100}%)`,
                      }}
                    />
                  </div>
                  <span className="ml-1 text-[11px] tabular-nums text-[var(--text-muted)]">
                    {index + 1}/{pages}
                  </span>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {lightbox && zoomed !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoomed(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Fotoğraf görüntüleyici"
        >
          <button
            type="button"
            onClick={() => setZoomed(null)}
            aria-label="Kapat"
            className="absolute right-4 top-4 p-2 text-white/60 transition-colors hover:text-white"
          >
            ✕
          </button>
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setZoomed((z) => (z === null ? null : (z - 1 + count) % count)); }}
                aria-label="Önceki"
                className="absolute left-2 top-1/2 -translate-y-1/2 p-4 text-2xl text-white/60 transition-colors hover:text-white sm:left-6"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setZoomed((z) => (z === null ? null : (z + 1) % count)); }}
                aria-label="Sonraki"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-4 text-2xl text-white/60 transition-colors hover:text-white sm:right-6"
              >
                ›
              </button>
            </>
          )}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[zoomed].url}
              alt={images[zoomed].alt?.trim() || `Fotoğraf ${zoomed + 1}`}
              width={1400}
              height={1400}
              className="max-h-[85vh] w-auto object-contain"
            />
          </div>
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs tabular-nums text-white/40">
            {zoomed + 1} / {count}
          </span>
        </div>
      )}
    </>
  );
}

function SliderArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Önceki fotoğraf" : "Sonraki fotoğraf"}
      className={`absolute top-1/2 hidden -translate-y-1/2 items-center justify-center bg-black/25 p-2.5 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/45 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:flex ${
        side === "left" ? "left-0" : "right-0"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        {side === "left" ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
      </svg>
    </button>
  );
}
