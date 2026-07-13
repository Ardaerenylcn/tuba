import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPostBySlug, getOtherPosts, readingTimeMinutes } from "@/lib/blog";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";
import { BlogCoverFallback } from "@/components/storefront/blog-cover-fallback";
import type { Metadata } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://tubaatman.com";

interface Props { params: Promise<{ slug: string }> }

function fmtDate(d: Date | string | null) {
  if (!d) return "";
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Yazı bulunamadı" };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || undefined;
  const url = `${BASE}/blog/${post.slug}`;
  const image = post.coverImage?.url;
  return {
    title: `${title} | Tuba Atman Jewelry`,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      images: image ? [{ url: image }] : undefined,
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.authorName],
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const others = await getOtherPosts(post.id, 5);
  const minutes = readingTimeMinutes(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription || post.excerpt || undefined,
    image: post.coverImage?.url ? [post.coverImage.url] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: post.authorName },
    publisher: { "@type": "Organization", name: "Tuba Atman Jewelry" },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE}/blog/${post.slug}` },
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
        <Link href="/blog" className="transition-colors hover:text-[var(--text-primary)]">Blog</Link>
        {post.category && (
          <>
            <span className="text-[var(--text-disabled)]">/</span>
            <Link href={`/blog?kategori=${encodeURIComponent(post.category)}`} className="transition-colors hover:text-[var(--text-primary)]">{post.category}</Link>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
        {/* ── Ana içerik ─────────────────────────────────────────── */}
        <article className="min-w-0">
          <header className="mb-8 border-b border-[var(--border)] pb-8">
            {post.category && (
              <span className="mb-4 inline-block text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">
                {post.category}
              </span>
            )}
            <h1
              className="text-[clamp(2rem,5vw,3.25rem)] font-light leading-[1.08] tracking-tight text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">{post.excerpt}</p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--text-muted)]">
              <span className="font-medium text-[var(--text-secondary)]">{post.authorName}</span>
              <span className="text-[var(--text-disabled)]">·</span>
              <span>{fmtDate(post.publishedAt)}</span>
              <span className="text-[var(--text-disabled)]">·</span>
              <span>{minutes} dk okuma</span>
            </div>
          </header>

          {/* Kapak yalnızca görsel varsa — görselsizken boş kutu bırakılmaz */}
          {post.coverImage?.url && (
            <figure className="relative mb-10 aspect-[16/9] overflow-hidden rounded-sm bg-[var(--bg-subtle)]">
              <Image src={post.coverImage.url} alt={post.title} fill sizes="(max-width:1024px) 100vw, 700px" className="object-cover" priority />
            </figure>
          )}

          <div className="rich-content max-w-none text-[15.5px] leading-[1.85]">
            <RichTextRenderer content={post.content} />
          </div>

          {post.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-8">
              <span className="mr-1 text-xs text-[var(--text-muted)]">Etiketler:</span>
              {post.tags.map((t) => (
                <Link key={t} href={`/blog?etiket=${encodeURIComponent(t)}`} className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]">#{t}</Link>
              ))}
            </div>
          )}

          <div className="mt-10">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
              <span aria-hidden>←</span> Tüm yazılar
            </Link>
          </div>
        </article>

        {/* ── Kenar çubuğu: diğer yazılar ────────────────────────── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border-t-2 border-[var(--text-primary)] pt-4">
            <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)]">Diğer Yazılar</h2>
            {others.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">Başka yazı yok.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-[var(--border)]">
                {others.map((o) => (
                  <li key={o.id}>
                    <Link href={`/blog/${o.slug}`} className="group flex gap-3.5 py-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-[var(--bg-subtle)]">
                        {o.coverImage?.url ? (
                          <Image src={o.coverImage.url} alt={o.title} fill sizes="64px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <BlogCoverFallback seed={o.slug} label={o.title} compact />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col justify-center gap-1">
                        {o.category && (
                          <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">{o.category}</span>
                        )}
                        <h3 className="line-clamp-2 text-[13.5px] font-medium leading-snug text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">{o.title}</h3>
                        <span className="text-[11px] text-[var(--text-muted)]">{fmtDate(o.publishedAt)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <Link href="/blog" className="mt-5 inline-flex text-xs font-medium uppercase tracking-[0.15em] text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]">
              Tümünü gör →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
