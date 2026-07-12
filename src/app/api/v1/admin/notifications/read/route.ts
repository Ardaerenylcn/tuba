import { db } from "@/lib/db";
import { ok, badRequest, forbidden, serverError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

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
  const { id, all } = body as { id?: string; all?: boolean };

  try {
    if (all) {
      await db.notification.updateMany({ where: { read: false }, data: { read: true, readAt: new Date() } });
    } else if (id) {
      await db.notification.update({ where: { id }, data: { read: true, readAt: new Date() } });
    } else {
      return badRequest("id veya all gerekli.");
    }
    const unreadCount = await db.notification.count({ where: { read: false } });
    return ok({ unreadCount });
  } catch (err) {
    console.error("[POST /api/v1/admin/notifications/read]", err);
    return serverError();
  }
}
