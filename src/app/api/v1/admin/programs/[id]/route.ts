import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badRequest, forbidden, notFound, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const patchSchema = z.object({
  type: z.enum(["workshop", "certificate"]).optional(),
  title: z.string().min(2).max(200).optional(),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/).optional(),
  shortDescription: z.string().min(10).max(500).optional(),
  description: z.any().optional(),
  basePrice: z.number().min(0).optional(),
  currency: z.string().optional(),
  defaultCapacity: z.number().int().min(1).optional().nullable(),
  durationMinutes: z.number().int().min(1).optional().nullable(),
  level: z.enum(["beginner", "intermediate", "advanced", "all_levels"]).optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
  coverImageId: z.string().optional().nullable(),
  coverImagePosition: z.string().optional().nullable(),
  galleryImageUrls: z.array(z.string()).optional(),
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
    const program = await db.program.findUnique({
      where: { id },
      include: { _count: { select: { sessions: true } } },
    });
    if (!program) return notFound("Program bulunamadı.");
    return ok(program);
  } catch (err) {
    console.error("[GET /api/v1/admin/programs/:id]", err);
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

  try {
    const existing = await db.program.findUnique({ where: { id } });
    if (!existing) return notFound("Program bulunamadı.");

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugTaken = await db.program.findUnique({ where: { slug: parsed.data.slug } });
      if (slugTaken) return badRequest("Bu slug zaten kullanımda.");
    }

    const { coverImageId, galleryImageUrls, ...rest } = parsed.data;
    const program = await db.program.update({
      where: { id },
      data: {
        ...rest,
        ...(coverImageId !== undefined
          ? { coverImage: coverImageId ? { connect: { id: coverImageId } } : { disconnect: true } }
          : {}),
        ...(galleryImageUrls !== undefined ? { galleryImageIds: galleryImageUrls } : {}),
      },
    });

    await db.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: "program.update",
        entityType: "Program",
        entityId: program.id,
        oldValue: existing as any,
        newValue: program as any,
      },
    });

    return ok(program, "Program güncellendi.");
  } catch (err) {
    console.error("[PATCH /api/v1/admin/programs/:id]", err);
    return serverError();
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await checkAdmin();
  if (!session) return forbidden();

  const { id } = await params;

  try {
    const existing = await db.program.findUnique({
      where: { id },
      include: { _count: { select: { sessions: true } } },
    });
    if (!existing) return notFound("Program bulunamadı.");

    if (existing._count.sessions > 0) {
      return badRequest(`Bu programa bağlı ${existing._count.sessions} oturum var. Önce oturumları silin.`);
    }

    await db.program.delete({ where: { id } });

    await db.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: "program.delete",
        entityType: "Program",
        entityId: id,
        oldValue: existing as any,
      },
    });

    return ok(null, "Program silindi.");
  } catch (err) {
    console.error("[DELETE /api/v1/admin/programs/:id]", err);
    return serverError();
  }
}
