import { z } from "zod";
import { db } from "@/lib/db";
import { ok, created, badRequest, forbidden, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const postSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug yalnızca küçük harf, rakam ve tire içerebilir"),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.any(),
  coverImageId: z.string().optional().nullable(),
  authorName: z.string().max(100).default("Tuba Atman"),
  category: z.string().max(100).optional().nullable(),
  tags: z.array(z.string().max(50)).default([]),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
});

async function checkAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "admin" && session.user.role !== "editor") return null;
  return session;
}

export async function GET() {
  const session = await checkAdmin();
  if (!session) return forbidden();
  try {
    const posts = await db.blogPost.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: { coverImage: { select: { url: true } } },
    });
    return ok(posts);
  } catch (err) {
    console.error("[GET /api/v1/admin/blog]", err);
    return serverError();
  }
}

export async function POST(request: Request) {
  const session = await checkAdmin();
  if (!session) return forbidden();

  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek."); }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);
  const d = parsed.data;

  try {
    const existing = await db.blogPost.findUnique({ where: { slug: d.slug } });
    if (existing) return badRequest("Bu slug zaten kullanımda.");

    // Yayında ama publishedAt yoksa şimdi yap
    const publishedAt = d.publishedAt ? new Date(d.publishedAt) : d.status === "published" ? new Date() : null;

    const post = await db.blogPost.create({
      data: {
        title: d.title, slug: d.slug, excerpt: d.excerpt || null, content: d.content ?? { type: "doc", content: [] },
        coverImageId: d.coverImageId || null, authorName: d.authorName, category: d.category || null, tags: d.tags,
        seoTitle: d.seoTitle || null, seoDescription: d.seoDescription || null, status: d.status, featured: d.featured, publishedAt,
      },
    });
    return created(post, "Yazı oluşturuldu.");
  } catch (err) {
    console.error("[POST /api/v1/admin/blog]", err);
    return serverError();
  }
}
