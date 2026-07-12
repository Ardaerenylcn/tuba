"use client";

import { useEffect, useState } from "react";
import type { PublicReview } from "@/lib/reviews";

/** Footer'da kısa, dönüşümlü öne çıkan yorum gösterimi. */
export function FooterReviews({ reviews }: { reviews: PublicReview[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reviews.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % reviews.length), 5000);
    return () => clearInterval(t);
  }, [reviews.length]);

  if (reviews.length === 0) return null;
  const r = reviews[i];

  return (
    <div className="flex flex-col gap-2" aria-live="polite">
      <div className="flex gap-0.5" aria-label={`${r.rating} / 5 yıldız`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={n <= r.rating ? "text-amber-500" : "text-stone-300"} aria-hidden>★</span>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-[var(--text-secondary)] transition-opacity duration-500">“{r.body}”</p>
      <p className="text-[11px] font-medium text-[var(--text-primary)]">— {r.name}</p>
      {reviews.length > 1 && (
        <div className="mt-1 flex gap-1">
          {reviews.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Yorum ${idx + 1}`}
              className={`h-1 w-4 rounded-full transition-colors ${idx === i ? "bg-[var(--text-primary)]" : "bg-[var(--border)]"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
