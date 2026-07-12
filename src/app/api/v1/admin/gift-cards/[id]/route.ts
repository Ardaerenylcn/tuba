import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badRequest, forbidden, notFound, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const patchSchema = z.object({
  status: z.enum(["active", "cancelled"]).optional(),
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
    const existing = await db.giftCard.findUnique({ where: { id } });
    if (!existing) return notFound("Hediye kartı bulunamadı.");

    const updated = await db.giftCard.update({ where: { id }, data: parsed.data });
    return ok({ id: updated.id, status: updated.status }, "Hediye kartı güncellendi.");
  } catch (err) {
    console.error("[PATCH /api/v1/admin/gift-cards/:id]", err);
    return serverError();
  }
}
