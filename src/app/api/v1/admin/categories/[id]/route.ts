import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badRequest, forbidden, notFound, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().optional(),
  showOnHome: z.boolean().optional(),
  isActive: z.boolean().optional(),
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
    const existing = await db.programCategory.findUnique({ where: { id } });
    if (!existing) return notFound("Tür bulunamadı.");

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugConflict = await db.programCategory.findUnique({ where: { slug: parsed.data.slug } });
      if (slugConflict) return badRequest("Bu slug zaten kullanımda.");
    }

    const updated = await db.programCategory.update({ where: { id }, data: parsed.data });
    return ok(updated, "Tür güncellendi.");
  } catch (err) {
    console.error("[PATCH /api/v1/admin/categories/:id]", err);
    return serverError();
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await checkAdmin();
  if (!session) return forbidden();

  const { id } = await params;
  try {
    const existing = await db.programCategory.findUnique({
      where: { id },
      include: { _count: { select: { programs: true } } },
    });
    if (!existing) return notFound("Tür bulunamadı.");
    if (existing._count.programs > 0)
      return badRequest(`Bu türe bağlı ${existing._count.programs} program var. Önce programları güncelleyin.`);

    await db.programCategory.delete({ where: { id } });
    return ok(null, "Tür silindi.");
  } catch (err) {
    console.error("[DELETE /api/v1/admin/categories/:id]", err);
    return serverError();
  }
}
