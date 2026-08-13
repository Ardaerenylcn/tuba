import { db } from "@/lib/db";
import { ok, forbidden, serverError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

async function checkAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "admin" && session.user.role !== "editor") return null;
  return session;
}

/**
 * Aktarma seçicisi için oturum listesi.
 *
 * Katılımcıyı başka bir oturuma taşırken hedefi seçmek gerekiyor; boş yer
 * bilgisi de burada hesaplanır (participantCount toplamı) ki arayüz dolu
 * oturumu işaretleyebilsin. İptal edilmiş oturumlar listelenmez.
 */
export async function GET(request: Request) {
  const auth = await checkAdmin();
  if (!auth) return forbidden();

  const url = new URL(request.url);
  const includePast = url.searchParams.get("includePast") === "1";

  try {
    const sessions = await db.workshopSession.findMany({
      where: {
        status: { not: "cancelled" },
        ...(includePast ? {} : { startAt: { gte: new Date() } }),
      },
      orderBy: { startAt: "asc" },
      take: 300,
      select: {
        id: true,
        startAt: true,
        endAt: true,
        capacity: true,
        status: true,
        locationName: true,
        program: { select: { id: true, title: true } },
        reservations: {
          where: { status: { in: ["pending", "confirmed"] } },
          select: { participantCount: true },
        },
      },
    });

    return ok(
      sessions.map((s) => {
        const booked = s.reservations.reduce((a, r) => a + r.participantCount, 0);
        return {
          id: s.id,
          programId: s.program.id,
          programTitle: s.program.title,
          startAt: s.startAt.toISOString(),
          endAt: s.endAt.toISOString(),
          capacity: s.capacity,
          booked,
          available: Math.max(0, s.capacity - booked),
          status: s.status,
          locationName: s.locationName,
        };
      }),
    );
  } catch (err) {
    console.error("[GET /api/v1/admin/sessions]", err);
    return serverError();
  }
}
