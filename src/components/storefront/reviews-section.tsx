import type { PublicReview } from "@/lib/reviews";

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value} / 5 yıldız`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? "text-amber-500" : "text-stone-300"} aria-hidden>★</span>
      ))}
    </div>
  );
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

/** Anasayfa yorumlar bölümü. */
export function ReviewsSection({ reviews, title = "Katılımcılarımız ne diyor?" }: { reviews: PublicReview[]; title?: string }) {
  if (reviews.length === 0) return null;

  return (
    <section className="border-t border-[var(--border)] bg-[var(--bg-subtle)] py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-xl">
          <p className="mb-3 text-[10px] font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">Yorumlar</p>
          <h2 className="text-2xl font-light tracking-tight text-[var(--text-primary)] sm:text-3xl">{title}</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.id} className="flex flex-col gap-3 border border-[var(--border)] bg-[var(--surface)] p-5">
              <Stars value={r.rating} />
              <blockquote className="flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">“{r.body}”</blockquote>
              <figcaption className="flex items-center gap-3 border-t border-[var(--border)] pt-3">
                {r.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- kullanıcı avatarı, harici URL
                  <img src={r.avatarUrl} alt={r.name} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-subtle)] text-[10px] font-medium text-[var(--text-secondary)]">{initials(r.name)}</span>
                )}
                <div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">{r.name}</p>
                  {r.programTitle && <p className="text-[10px] text-[var(--text-muted)]">{r.programTitle}</p>}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
