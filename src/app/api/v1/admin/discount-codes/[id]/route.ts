import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badRequest, forbidden, notFound, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const schema = z.object({
  active: z.boolean().optional(),
  maxUses: z.number().int().positive().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
});

async function checkAdmin() {
  const session = await getSession();
  if (!session || (session.user.role !== "admin" && session.user.role !== "editor")) return null;
  return session;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return forbidden();
  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek."); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  try {
    const code = await db.discountCode.update({
      where: { id },
      data: {
        ...parsed.data,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : parsed.data.expiresAt,
      },
    });
    return ok(code, "Güncellendi.");
  } catch {
    return notFound("Kod bulunamadı.");
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return forbidden();
  const { id } = await params;
  try {
    await db.discountCode.delete({ where: { id } });
    return ok(null, "Silindi.");
  } catch {
    return notFound("Kod bulunamadı.");
  }
}
