import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPostBySlug, getRelatedPosts } from "@/lib/blog";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";
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

  const related = await getRelatedPosts({ id: post.id, category: post.category, tags: post.tags }, 3);

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
    <article className="mx-auto max-w-3xl px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href="/blog" className="mb-8 inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">← Blog</Link>

      <header className="mb-8 flex flex-col gap-4">
        {post.category && <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--text-muted)]">{post.category}</span>}
        <h1 className="text-3xl font-light leading-tight tracking-tight text-[var(--text-primary)] sm:text-4xl">{post.title}</h1>
        <p className="text-sm text-[var(--text-muted)]">{post.authorName} · {fmtDate(post.publishedAt)}</p>
      </header>

      {post.coverImage?.url && (
        <div className="relative mb-10 aspect-[16/9] overflow-hidden bg-[var(--bg-subtle)]">
          <Image src={post.coverImage.url} alt={post.title} fill sizes="(max-width:768px) 100vw, 768px" className="object-cover" priority />
        </div>
      )}

      <div className="prose-tuba">
        <RichTextRenderer content={post.content} />
      </div>

      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-[var(--border)] pt-6">
          {post.tags.map((t) => (
            <Link key={t} href={`/blog?etiket=${encodeURIComponent(t)}`} className="border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]">#{t}</Link>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-16 border-t border-[var(--border)] pt-10">
          <h2 className="mb-6 text-sm font-medium uppercase tracking-widest text-[var(--text-muted)]">İlgili Yazılar</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} href={`/blog/${r.slug}`} className="group flex flex-col gap-2">
                <div className="relative aspect-[3/2] overflow-hidden bg-[var(--bg-subtle)]">
                  {r.coverImage?.url ? (
                    <Image src={r.coverImage.url} alt={r.title} fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[var(--text-disabled)]">✎</span>
                  )}
                </div>
                <h3 className="text-sm font-medium leading-snug text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">{r.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
