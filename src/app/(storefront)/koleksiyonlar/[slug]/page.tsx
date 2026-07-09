import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { DEFAULT_COLLECTIONS } from "@/lib/site-content";
import type { CollectionsConfig } from "@/lib/site-content";
import { FadeUp } from "@/components/ui/animate";
import Link from "next/link";
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
    items: raw.items ?? DEFAULT_COLLECTIONS.items,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cfg = await getCollections();
  const item = cfg.items.find((c) => c.slug === slug);
  if (!item) return {};
  return { title: `${item.label} | Atölye Biz` };
}

export default async function KoleksiyonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cfg = await getCollections();
  const item = cfg.items.find((c) => c.slug === slug);
  if (!item) notFound();

  const others = cfg.items.filter((c) => c.slug !== slug).slice(0, 4);

  return (
    <div className="min-h-[60vh]">
      {/* Hero */}
      <div
        className="relative flex min-h-[50vh] items-end px-6 pb-16 pt-32"
        style={{ background: item.bg }}
      >
        {/* Dekoratif halkalar */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            viewBox="0 0 400 400"
            fill="none"
            stroke="#2c1810"
            strokeWidth="0.4"
            className="w-[60vw] max-w-xl opacity-[0.12]"
            aria-hidden
          >
            <circle cx="200" cy="200" r="190" />
            <circle cx="200" cy="200" r="155" />
            <circle cx="200" cy="200" r="120" />
            <circle cx="200" cy="200" r="85" />
            <circle cx="200" cy="200" r="50" />
            <circle cx="200" cy="200" r="20" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl w-full">
          <FadeUp>
            <p className="mb-3 text-[10px] font-medium tracking-[0.35em] uppercase text-[#2c1810]/60">
              Koleksiyon
            </p>
            <h1
              className="text-[clamp(2.5rem,7vw,5rem)] font-light leading-none tracking-[0.1em] uppercase text-[#2c1810]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              {item.label}
            </h1>
          </FadeUp>
        </div>
      </div>

      {/* İçerik */}
      <div className="mx-auto max-w-7xl px-6 py-20">
        {/* Yakında geliyor mesajı */}
        <FadeUp>
          <div className="flex flex-col items-center gap-6 border border-[var(--border)] bg-[var(--bg-subtle)] py-20 px-8 text-center">
            <div
              className="w-12 h-12 rounded-full"
              style={{ background: item.bg }}
            />
            <p
              className="text-2xl font-light text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              {item.label} Koleksiyonu
            </p>
            <p className="text-sm text-[var(--text-muted)] max-w-sm leading-relaxed">
              Bu koleksiyon yakında sizlerle. Yeni ürünleri kaçırmamak için bültenimize abone olun.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/iletisim"
                className="inline-flex h-10 items-center bg-[var(--text-primary)] px-6 text-xs font-medium tracking-[0.1em] uppercase text-[var(--surface)]"
              >
                Bilgi Al
              </Link>
              <Link
                href="/atolyeler"
                className="inline-flex h-10 items-center border border-[var(--border-strong)] px-6 text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--surface)] transition-colors"
              >
                Atölyelere Bak
              </Link>
            </div>
          </div>
        </FadeUp>

        {/* Diğer koleksiyonlar */}
        {others.length > 0 && (
          <FadeUp delay={0.1} className="mt-20">
            <h2 className="mb-8 text-[10px] font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">
              Diğer Koleksiyonlar
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {others.map((other) => (
                <Link
                  key={other.slug}
                  href={`/koleksiyonlar/${other.slug}`}
                  className="group flex flex-col gap-3"
                >
                  <div
                    className="aspect-square relative overflow-hidden"
                    style={{ background: other.bg }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <svg
                        viewBox="0 0 120 120"
                        fill="none"
                        stroke="#2c1810"
                        strokeWidth="0.6"
                        className="w-2/3 h-2/3 opacity-[0.15]"
                        aria-hidden
                      >
                        <circle cx="60" cy="60" r="55" />
                        <circle cx="60" cy="60" r="40" />
                        <circle cx="60" cy="60" r="25" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-300" />
                  </div>
                  <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--text-primary)] group-hover:text-[var(--text-secondary)] transition-colors">
                    {other.label}
                  </p>
                </Link>
              ))}
            </div>
          </FadeUp>
        )}
      </div>
    </div>
  );
}
