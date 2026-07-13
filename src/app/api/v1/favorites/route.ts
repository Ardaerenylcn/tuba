import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badRequest, forbidden, serverError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

// GET — kullanıcının favori programları
export async function GET() {
  const auth = await getSession();
  if (!auth) return forbidden("Giriş yapmalısınız.");
  try {
    const favs = await db.favorite.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: "desc" },
      select: { programId: true },
    });
    return ok(favs.map((f) => f.programId));
  } catch (err) {
    console.error("[GET /api/v1/favorites]", err);
    return serverError();
  }
}

// POST — favori ekle/çıkar (toggle)
export async function POST(request: Request) {
  const auth = await getSession();
  if (!auth) return forbidden("Favorilere eklemek için giriş yapın.");

  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek."); }
  const parsed = z.object({ programId: z.string().min(1) }).safeParse(body);
  if (!parsed.success) return badRequest("Program gerekli.");
  const { programId } = parsed.data;

  try {
    const program = await db.program.findUnique({ where: { id: programId }, select: { id: true } });
    if (!program) return badRequest("Program bulunamadı.");

    const existing = await db.favorite.findUnique({
      where: { userId_programId: { userId: auth.user.id, programId } },
    });

    if (existing) {
      await db.favorite.delete({ where: { id: existing.id } });
      return ok({ favorited: false }, "Favorilerden çıkarıldı.");
    }

    await db.favorite.create({ data: { userId: auth.user.id, programId } });
    return ok({ favorited: true }, "Favorilere eklendi.");
  } catch (err) {
    console.error("[POST /api/v1/favorites]", err);
    return serverError();
  }
}
