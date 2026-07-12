import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badRequest, forbidden, notFound, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const patchSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.any().optional(),
  coverImageId: z.string().optional().nullable(),
  authorName: z.string().max(100).optional(),
  category: z.string().max(100).optional().nullable(),
  tags: z.array(z.string().max(50)).optional(),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  featured: z.boolean().optional(),
  publishedAt: z.string().datetime().optional().nullable(),
});

async function checkAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "admin" && session.user.role !== "editor") return null;
  return session;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await checkAdmin();
  if (!session) return forbidden();
  const { id } = await params;
  try {
    const post = await db.blogPost.findUnique({ where: { id }, include: { coverImage: { select: { url: true } } } });
    if (!post) return notFound("Yazı bulunamadı.");
    return ok(post);
  } catch (err) {
    console.error("[GET /api/v1/admin/blog/:id]", err);
    return serverError();
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await checkAdmin();
  if (!session) return forbidden();

  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek."); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);
  const d = parsed.data;

  try {
    const existing = await db.blogPost.findUnique({ where: { id } });
    if (!existing) return notFound("Yazı bulunamadı.");

    if (d.slug && d.slug !== existing.slug) {
      const conflict = await db.blogPost.findUnique({ where: { slug: d.slug } });
      if (conflict) return badRequest("Bu slug zaten kullanımda.");
    }

    // Yayına alınıyorsa ve publishedAt yoksa şimdi ayarla
    let publishedAt = d.publishedAt !== undefined ? (d.publishedAt ? new Date(d.publishedAt) : null) : undefined;
    if (d.status === "published" && !existing.publishedAt && publishedAt === undefined) {
      publishedAt = new Date();
    }

    const updated = await db.blogPost.update({
      where: { id },
      data: {
        ...(d.title !== undefined && { title: d.title }),
        ...(d.slug !== undefined && { slug: d.slug }),
        ...(d.excerpt !== undefined && { excerpt: d.excerpt || null }),
        ...(d.content !== undefined && { content: d.content }),
        ...(d.coverImageId !== undefined && { coverImageId: d.coverImageId || null }),
        ...(d.authorName !== undefined && { authorName: d.authorName }),
        ...(d.category !== undefined && { category: d.category || null }),
        ...(d.tags !== undefined && { tags: d.tags }),
        ...(d.seoTitle !== undefined && { seoTitle: d.seoTitle || null }),
        ...(d.seoDescription !== undefined && { seoDescription: d.seoDescription || null }),
        ...(d.status !== undefined && { status: d.status }),
        ...(d.featured !== undefined && { featured: d.featured }),
        ...(publishedAt !== undefined && { publishedAt }),
      },
    });
    return ok(updated, "Yazı güncellendi.");
  } catch (err) {
    console.error("[PATCH /api/v1/admin/blog/:id]", err);
    return serverError();
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await checkAdmin();
  if (!session) return forbidden();
  const { id } = await params;
  try {
    const existing = await db.blogPost.findUnique({ where: { id } });
    if (!existing) return notFound("Yazı bulunamadı.");
    await db.blogPost.delete({ where: { id } });
    return ok(null, "Yazı silindi.");
  } catch (err) {
    console.error("[DELETE /api/v1/admin/blog/:id]", err);
    return serverError();
  }
}
