import Link from "next/link";
import Image from "next/image";
import { getPublishedPosts, getBlogTaxonomy } from "@/lib/blog";
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

function fmtDate(d: Date | string | null) {
  if (!d) return "";
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
}

function PostCard({ post, large = false }: { post: Awaited<ReturnType<typeof getPublishedPosts>>[number]; large?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col gap-3">
      <div className={`relative overflow-hidden bg-[var(--bg-subtle)] ${large ? "aspect-[16/9]" : "aspect-[3/2]"}`}>
        {post.coverImage?.url ? (
          <Image src={post.coverImage.url} alt={post.title} fill sizes={large ? "(max-width:1024px) 100vw, 66vw" : "(max-width:640px) 100vw, 33vw"}
            className="object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[var(--text-disabled)]">✎</span>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {post.category && <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">{post.category}</span>}
        <h3 className={`font-medium leading-snug text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)] ${large ? "text-2xl" : "text-base"}`}>{post.title}</h3>
        {post.excerpt && <p className="text-sm leading-relaxed text-[var(--text-secondary)] line-clamp-2">{post.excerpt}</p>}
        <p className="text-xs text-[var(--text-muted)]">{post.authorName} · {fmtDate(post.publishedAt)}</p>
      </div>
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
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 max-w-2xl">
        <p className="mb-3 text-xs font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">Blog</p>
        <h1 className="mb-4 text-4xl font-light tracking-tight text-[var(--text-primary)] sm:text-5xl">Atölyeden notlar</h1>
        <p className="text-base leading-relaxed text-[var(--text-secondary)]">
          Takı tasarımı, el işçiliği ve atölye deneyimleri üzerine yazılar, ipuçları ve ilhamlar.
        </p>
      </div>

      {/* Kategori filtreleri */}
      {taxonomy.categories.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2">
          <Link href="/blog" className={`border px-3 py-1.5 text-xs transition-colors ${!isFiltered ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--surface)]" : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]"}`}>Tümü</Link>
          {taxonomy.categories.map((c) => (
            <Link key={c} href={`/blog?kategori=${encodeURIComponent(c)}`}
              className={`border px-3 py-1.5 text-xs transition-colors ${kategori === c ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--surface)]" : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]"}`}>{c}</Link>
          ))}
        </div>
      )}

      {etiket && (
        <p className="mb-6 text-sm text-[var(--text-muted)]">Etiket: <span className="text-[var(--text-primary)]">#{etiket}</span> · <Link href="/blog" className="underline underline-offset-2">temizle</Link></p>
      )}

      {posts.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center border border-dashed border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)]">Henüz yazı yok.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {featured && <PostCard post={featured} large />}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
