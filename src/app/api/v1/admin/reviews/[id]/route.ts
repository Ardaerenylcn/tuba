import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badRequest, forbidden, notFound, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const patchSchema = z.object({
  authorName: z.string().min(2).max(100).optional(),
  displayName: z.string().max(100).optional().nullable(),
  avatarUrl: z.string().max(500).optional().nullable(),
  rating: z.number().int().min(1).max(5).optional(),
  body: z.string().min(3).max(2000).optional(),
  programId: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

async function checkAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "admin" && session.user.role !== "editor") return null;
  return session;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await checkAdmin();
  if (!session) return forbidden();

  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek."); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  try {
    const existing = await db.review.findUnique({ where: { id } });
    if (!existing) return notFound("Yorum bulunamadı.");

    const d = parsed.data;
    const updated = await db.review.update({
      where: { id },
      data: {
        ...(d.authorName !== undefined && { authorName: d.authorName }),
        ...(d.displayName !== undefined && { displayName: d.displayName || null }),
        ...(d.avatarUrl !== undefined && { avatarUrl: d.avatarUrl || null }),
        ...(d.rating !== undefined && { rating: d.rating }),
        ...(d.body !== undefined && { body: d.body }),
        ...(d.programId !== undefined && { programId: d.programId || null }),
        ...(d.status !== undefined && { status: d.status }),
        ...(d.featured !== undefined && { featured: d.featured }),
        ...(d.sortOrder !== undefined && { sortOrder: d.sortOrder }),
      },
      include: { program: { select: { title: true } } },
    });
    return ok(updated, "Yorum güncellendi.");
  } catch (err) {
    console.error("[PATCH /api/v1/admin/reviews/:id]", err);
    return serverError();
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await checkAdmin();
  if (!session) return forbidden();

  const { id } = await params;
  try {
    const existing = await db.review.findUnique({ where: { id } });
    if (!existing) return notFound("Yorum bulunamadı.");
    await db.review.delete({ where: { id } });
    return ok(null, "Yorum silindi.");
  } catch (err) {
    console.error("[DELETE /api/v1/admin/reviews/:id]", err);
    return serverError();
  }
}
