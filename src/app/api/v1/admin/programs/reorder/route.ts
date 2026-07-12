import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badRequest, forbidden, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

async function checkAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "admin" && session.user.role !== "editor") return null;
  return session;
}

export async function POST(request: Request) {
  const session = await checkAdmin();
  if (!session) return forbidden();

  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek."); }

  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  try {
    await db.$transaction(
      parsed.data.ids.map((id, index) =>
        db.program.update({ where: { id }, data: { sortOrder: index } })
      )
    );
    return ok(null, "Sıralama güncellendi.");
  } catch (err) {
    console.error("[POST /api/v1/admin/programs/reorder]", err);
    return serverError();
  }
}
