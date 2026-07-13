import Link from "next/link";
import Image from "next/image";
import { getPublishedPosts, getBlogTaxonomy } from "@/lib/blog";
import { BlogCoverFallback } from "@/components/storefront/blog-cover-fallback";
import { FadeUp } from "@/components/ui/animate";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Tuba Atman Jewelry",
  description: "Takı tasarımı, el işçiliği ve atölye deneyimleri üzerine yazılar, ipuçları ve ilhamlar.",
  alternates: { canonical: "/blog" },
};

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ kategori?: string; etiket?: string }>;
}

type Post = Awaited<ReturnType<typeof getPublishedPosts>>[number];

function fmtDate(d: Date | string | null) {
  if (!d) return "";
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
}

const serif = { fontFamily: "var(--font-cormorant), Georgia, serif" } as const;

/* ── Öne çıkan yazı — büyük editöryel hero ───────────────────────── */
function FeaturedPost({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-[var(--bg-subtle)] lg:aspect-[5/4]">
        {post.coverImage?.url ? (
          <Image src={post.coverImage.url} alt={post.title} fill priority sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]" />
        ) : (
          <BlogCoverFallback seed={post.slug} label={post.title} />
        )}
        <span className="absolute left-4 top-4 rounded-full bg-[var(--surface)]/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)] backdrop-blur">
          Öne çıkan
        </span>
      </div>

      <div className="flex flex-col justify-center">
        {post.category && (
          <span className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">{post.category}</span>
        )}
        <h2 className="text-[clamp(1.9rem,3.5vw,3rem)] font-light leading-[1.1] tracking-tight text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]" style={serif}>
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] line-clamp-3">{post.excerpt}</p>
        )}
        <div className="mt-6 flex items-center gap-3 text-sm text-[var(--text-muted)]">
          <span className="font-medium text-[var(--text-secondary)]">{post.authorName}</span>
          <span className="text-[var(--text-disabled)]">·</span>
          <span>{fmtDate(post.publishedAt)}</span>
        </div>
        <span className="mt-7 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-primary)]">
          Yazıyı oku
          <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}

/* ── Standart kart ───────────────────────────────────────────────── */
function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-[var(--bg-subtle)]">
        {post.coverImage?.url ? (
          <Image src={post.coverImage.url} alt={post.title} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-105" />
        ) : (
          <BlogCoverFallback seed={post.slug} label={post.title} />
        )}
      </div>
      <div className="flex flex-col gap-2 pt-5">
        {post.category && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">{post.category}</span>
        )}
        <h3 className="text-xl font-normal leading-snug text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]" style={serif}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm leading-relaxed text-[var(--text-secondary)] line-clamp-2">{post.excerpt}</p>
        )}
        <p className="mt-1 text-xs text-[var(--text-muted)]">{post.authorName} · {fmtDate(post.publishedAt)}</p>
      </div>
    </Link>
  );
}

function FilterPill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href}
      className={`rounded-full border px-4 py-1.5 text-xs tracking-wide transition-colors ${
        active
          ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--surface)]"
          : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
      }`}>
      {children}
    </Link>
  );
}

export default async function BlogPage({ searchParams }: Props) {
  const { kategori, etiket } = await searchParams;
  const [posts, taxonomy] = await Promise.all([
    getPublishedPosts({ category: kategori, tag: etiket }),
    getBlogTaxonomy(),
  ]);

  const isFiltered = Boolean(kategori || etiket);
  const featured = !isFiltered ? posts.find((p) => p.featured) ?? posts[0] : null;
  const rest = featured ? posts.filter((p) => p.id !== featured.id) : posts;

  return (
    <div className="min-h-[70vh]">
      {/* ── Başlık ───────────────────────────────────────────────── */}
      <section className="border-b border-[var(--border)] bg-[var(--bg-subtle)]">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center sm:py-24">
          <FadeUp>
            <p className="mb-4 text-[11px] font-semibold tracking-[0.4em] uppercase text-[var(--text-muted)]">Journal</p>
            <h1 className="text-[clamp(2.6rem,7vw,5rem)] font-light leading-[0.95] tracking-tight text-[var(--text-primary)]" style={serif}>
              Atölyeden Notlar
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--text-secondary)]">
              Takı tasarımı, el işçiliği ve atölye deneyimleri üzerine yazılar, ipuçları ve ilhamlar.
            </p>
          </FadeUp>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        {/* Kategori filtreleri */}
        {taxonomy.categories.length > 0 && (
          <div className="mb-14 flex flex-wrap justify-center gap-2.5">
            <FilterPill href="/blog" active={!isFiltered}>Tümü</FilterPill>
            {taxonomy.categories.map((c) => (
              <FilterPill key={c} href={`/blog?kategori=${encodeURIComponent(c)}`} active={kategori === c}>{c}</FilterPill>
            ))}
          </div>
        )}

        {etiket && (
          <p className="mb-10 text-center text-sm text-[var(--text-muted)]">
            Etiket: <span className="text-[var(--text-primary)]">#{etiket}</span>
            {" · "}
            <Link href="/blog" className="underline underline-offset-2 hover:text-[var(--text-primary)]">temizle</Link>
          </p>
        )}

        {posts.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-[var(--border)] text-center">
            <span className="text-3xl text-[var(--text-disabled)]" style={serif} aria-hidden>✎</span>
            <p className="text-sm text-[var(--text-muted)]">
              {isFiltered ? "Bu seçime uygun yazı bulunamadı." : "Henüz yazı yok. Yakında buradayız."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-20">
            {featured && (
              <FadeUp>
                <FeaturedPost post={featured} />
              </FadeUp>
            )}

            {rest.length > 0 && (
              <div>
                {featured && (
                  <div className="mb-10 flex items-center gap-4">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-primary)]">Tüm Yazılar</h2>
                    <span className="h-px flex-1 bg-[var(--border)]" />
                  </div>
                )}
                <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((p, i) => (
                    <FadeUp key={p.id} delay={Math.min(i, 5) * 0.06}>
                      <PostCard post={p} />
                    </FadeUp>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
