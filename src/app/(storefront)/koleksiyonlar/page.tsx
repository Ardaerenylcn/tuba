import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { DEFAULT_COLLECTIONS } from "@/lib/site-content";
import type { CollectionsConfig } from "@/lib/site-content";
import { FadeUp } from "@/components/ui/animate";
import type { Metadata } from "next";

async function getCollections(): Promise<CollectionsConfig> {
  const entry = await db.siteContent.findUnique({
    where: { key_locale: { key: "collections", locale: "tr" } },
  });
  if (!entry?.value) return DEFAULT_COLLECTIONS;
  const raw = entry.value as Partial<CollectionsConfig>;
  return {
    ...DEFAULT_COLLECTIONS,
    ...raw,
    items: (raw.items ?? DEFAULT_COLLECTIONS.items).map((item) => ({
      ...item,
      imageUrl: item.imageUrl ?? null,
      imageId: item.imageId ?? null,
    })),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const cfg = await getCollections();
  return {
    title: `${cfg.heading} | Atölye Biz`,
    description: cfg.description,
    alternates: { canonical: "/koleksiyonlar" },
  };
}

export default async function KoleksiyonlarPage() {
  const cfg = await getCollections();

  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <FadeUp>
        <p className="mb-3 text-[10px] font-medium tracking-[0.35em] uppercase text-[var(--text-muted)]">
          Koleksiyon
        </p>
        <h1
          className="mb-4 text-[clamp(2.2rem,6vw,4rem)] font-light leading-none tracking-tight text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {cfg.heading}
        </h1>
        <p className="max-w-lg text-[15px] leading-relaxed text-[var(--text-secondary)]">
          {cfg.description}
        </p>
      </FadeUp>

      {cfg.items.length === 0 ? (
        <div className="mt-16 flex min-h-[240px] items-center justify-center border border-dashed border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)]">Henüz koleksiyon eklenmedi.</p>
        </div>
      ) : (
        <FadeUp delay={0.1} className="mt-14">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {cfg.items.map((item) => (
              <Link
                key={item.slug}
                href={`/koleksiyonlar/${item.slug}`}
                className="group flex flex-col gap-3"
              >
                <div
                  className="relative aspect-square overflow-hidden"
                  style={{ background: item.bg }}
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.label}
                      fill
                      sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <svg
                        viewBox="0 0 120 120"
                        fill="none"
                        stroke="#2c1810"
                        strokeWidth="0.6"
                        className="h-2/3 w-2/3 opacity-[0.15]"
                        aria-hidden
                      >
                        <circle cx="60" cy="60" r="55" />
                        <circle cx="60" cy="60" r="40" />
                        <circle cx="60" cy="60" r="25" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/8" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)] transition-colors group-hover:text-[var(--text-secondary)]">
                  {item.label}
                </p>
              </Link>
            ))}
          </div>
        </FadeUp>
      )}
    </div>
  );
}
