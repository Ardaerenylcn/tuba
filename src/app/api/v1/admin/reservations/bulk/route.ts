import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badRequest, forbidden, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const bulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(200),
  status: z.enum(["confirmed", "cancelled", "no_show", "completed", "waitlisted"]),
});

async function checkAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "admin" && session.user.role !== "editor") return null;
  return session;
}

export async function POST(request: Request) {
  const auth = await checkAdmin();
  if (!auth) return forbidden();

  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek."); }

  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const { ids, status } = parsed.data;
  const isCancelling = status === "cancelled";

  try {
    const updated = await db.$transaction(async (tx) => {
      const rows = await tx.reservation.findMany({
        where: { id: { in: ids } },
        select: { id: true, status: true, sessionId: true, session: { select: { status: true, capacity: true } } },
      });

      for (const r of rows) {
        await tx.reservation.update({
          where: { id: r.id },
          data: {
            status,
            ...(isCancelling ? { cancelledAt: new Date(), cancellationReason: "Toplu işlemle iptal edildi." } : {}),
          },
        });
      }

      // İptal edilenlerde "full" seansları gerekiyorsa yeniden yayına al
      if (isCancelling) {
        const sessionIds = [...new Set(rows.filter((r) => r.session.status === "full").map((r) => r.sessionId))];
        for (const sid of sessionIds) {
          const remaining = await tx.reservation.count({
            where: { sessionId: sid, status: { in: ["pending", "confirmed"] } },
          });
          const session = rows.find((r) => r.sessionId === sid)!.session;
          if (remaining < session.capacity) {
            await tx.workshopSession.update({ where: { id: sid }, data: { status: "published" } });
          }
        }
      }

      return rows.length;
    });

    return ok({ updated }, `${updated} rezervasyon güncellendi.`);
  } catch (err) {
    console.error("[POST /api/v1/admin/reservations/bulk]", err);
    return serverError();
  }
}
