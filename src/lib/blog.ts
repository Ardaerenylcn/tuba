import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma";

const publicWhere = (): Prisma.BlogPostWhereInput => ({
  status: "published",
  publishedAt: { lte: new Date() },
});

const listSelect = {
  id: true, title: true, slug: true, excerpt: true, category: true, tags: true,
  authorName: true, featured: true, publishedAt: true,
  coverImage: { select: { url: true } },
} satisfies Prisma.BlogPostSelect;

export async function getPublishedPosts(opts: { category?: string; tag?: string } = {}) {
  return db.blogPost.findMany({
    where: {
      ...publicWhere(),
      ...(opts.category ? { category: opts.category } : {}),
      ...(opts.tag ? { tags: { has: opts.tag } } : {}),
    },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    select: listSelect,
  });
}

export async function getPostBySlug(slug: string) {
  const post = await db.blogPost.findUnique({
    where: { slug },
    include: { coverImage: { select: { url: true } } },
  });
  if (!post) return null;
  // Yayında değilse veya ileri tarihliyse gösterme
  if (post.status !== "published" || (post.publishedAt && post.publishedAt > new Date())) return null;
  return post;
}

export async function getRelatedPosts(post: { id: string; category: string | null; tags: string[] }, limit = 3) {
  return db.blogPost.findMany({
    where: {
      ...publicWhere(),
      id: { not: post.id },
      OR: [
        ...(post.category ? [{ category: post.category }] : []),
        ...(post.tags.length ? [{ tags: { hasSome: post.tags } }] : []),
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: listSelect,
  });
}

export async function getBlogTaxonomy() {
  const posts = await db.blogPost.findMany({ where: publicWhere(), select: { category: true, tags: true } });
  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))] as string[];
  const tags = [...new Set(posts.flatMap((p) => p.tags))];
  return { categories, tags };
}
