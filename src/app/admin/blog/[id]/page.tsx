import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BlogForm } from "@/components/admin/blog-form";
import type { Metadata } from "next";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await db.blogPost.findUnique({ where: { id }, select: { title: true } });
  return { title: post ? `${post.title} | Blog | Admin` : "Yazı | Blog | Admin" };
}

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;
  const post = await db.blogPost.findUnique({ where: { id }, include: { coverImage: { select: { url: true } } } });
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/blog" className="mb-3 inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">← Blog</Link>
        <h1 className="text-xl font-medium text-[var(--text-primary)]">Yazıyı Düzenle</h1>
      </div>
      <BlogForm
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImageId: post.coverImageId,
          coverImageUrl: post.coverImage?.url ?? null,
          authorName: post.authorName,
          category: post.category,
          tags: post.tags,
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          status: post.status,
          featured: post.featured,
          publishedAt: post.publishedAt?.toISOString() ?? null,
        }}
      />
    </div>
  );
}
