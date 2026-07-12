import { db } from "@/lib/db";
import { ok, forbidden, serverError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

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
    const [items, unreadCount] = await Promise.all([
      db.notification.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
      db.notification.count({ where: { read: false } }),
    ]);
    return ok({
      unreadCount,
      items: items.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[GET /api/v1/admin/notifications]", err);
    return serverError();
  }
}
