"use client";

import { useState } from "react";
import Image from "next/image";

export function ProgramGallery({ urls }: { urls: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (urls.length === 0) return null;

  const prev = () => setLightbox((i) => (i !== null ? (i - 1 + urls.length) % urls.length : null));
  const next = () => setLightbox((i) => (i !== null ? (i + 1) % urls.length : null));

  return (
    <>
      <div className="mb-12">
        <h2 className="mb-5 text-xl font-light text-[var(--text-primary)]">Fotoğraflar</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {urls.map((url, i) => (
            <button
              key={i}
              onClick={() => setLightbox(i)}
              className="group relative aspect-[3/4] overflow-hidden border border-[var(--border)] bg-[var(--bg-muted)]"
            >
              <Image
                src={url}
                alt={`Fotoğraf ${i + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </div>

      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightbox(null)}
        >
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white">
            ‹
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={urls[lightbox]}
              alt={`Fotoğraf ${lightbox + 1}`}
              width={900}
              height={1200}
              className="max-h-[90vh] w-auto object-contain"
            />
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white/50">
              {lightbox + 1} / {urls.length}
            </span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white">
            ›
          </button>
          <button onClick={() => setLightbox(null)} className="absolute right-4 top-4 p-2 text-white/70 hover:text-white">
            ✕
          </button>
        </div>
      )}
    </>
  );
}
