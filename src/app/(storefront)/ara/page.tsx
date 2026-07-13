import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { BlogCoverFallback } from "@/components/storefront/blog-cover-fallback";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Arama", robots: { index: false } };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

const serif = { fontFamily: "var(--font-cormorant), Georgia, serif" } as const;

async function search(q: string) {
  const [programs, posts] = await Promise.all([
    db.program.findMany({
      where: {
        status: "published",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { shortDescription: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { title: true, slug: true, type: true, shortDescription: true, basePrice: true, coverImage: { select: { url: true } } },
      take: 12,
    }),
    db.blogPost.findMany({
      where: {
        status: "published",
        publishedAt: { lte: new Date() },
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { title: true, slug: true, excerpt: true, category: true, coverImage: { select: { url: true } } },
      take: 12,
    }),
  ]);
  return { programs, posts };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query.length >= 2 ? await search(query) : null;
  const total = results ? results.programs.length + results.posts.length : 0;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-6 text-[clamp(2rem,5vw,3rem)] font-light tracking-tight text-[var(--text-primary)]" style={serif}>
        Arama
      </h1>

      <form action="/ara" method="get" className="mb-10 flex gap-2">
        <input
          name="q"
          defaultValue={query}
          autoFocus
          placeholder="Program, atölye veya blog ara…"
          className="h-12 flex-1 border border-[var(--border)] bg-[var(--bg)] px-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
          aria-label="Arama"
        />
        <button type="submit" className="h-12 bg-[var(--text-primary)] px-6 text-[12px] font-semibold uppercase tracking-[0.15em] text-[var(--surface)] transition-colors hover:bg-[var(--accent-hover)]">
          Ara
        </button>
      </form>

      {query.length < 2 ? (
        <p className="text-sm text-[var(--text-muted)]">Aramak için en az 2 karakter girin.</p>
      ) : total === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">“{query}” için sonuç bulunamadı.</p>
      ) : (
        <div className="flex flex-col gap-12">
          <p className="text-xs text-[var(--text-muted)]">“{query}” için {total} sonuç</p>

          {results!.programs.length > 0 && (
            <section>
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)]">Programlar</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {results!.programs.map((p) => (
                  <Link key={p.slug} href={`/${p.type}/${p.slug}`} className="group flex gap-4 border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--text-primary)]">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-[var(--bg-subtle)]">
                      {p.coverImage?.url && <Image src={p.coverImage.url} alt={p.title} fill sizes="64px" className="object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)]">{p.title}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)]">{p.shortDescription}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">{Number(p.basePrice).toLocaleString("tr-TR")} ₺</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results!.posts.length > 0 && (
            <section>
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)]">Blog</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {results!.posts.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex gap-4 border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--text-primary)]">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-[var(--bg-subtle)]">
                      {p.coverImage?.url ? (
                        <Image src={p.coverImage.url} alt={p.title} fill sizes="64px" className="object-cover" />
                      ) : (
                        <BlogCoverFallback seed={p.slug} label={p.title} compact />
                      )}
                    </div>
                    <div className="min-w-0">
                      {p.category && <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">{p.category}</span>}
                      <h3 className="truncate text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)]">{p.title}</h3>
                      {p.excerpt && <p className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)]">{p.excerpt}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
