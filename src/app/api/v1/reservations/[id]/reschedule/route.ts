import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badRequest, forbidden, notFound, conflict, serverError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const ACTIVE = ["pending", "confirmed"];

async function loadOwned(id: string) {
  const auth = await getSession();
  if (!auth) return { error: "unauth" as const };
  const reservation = await db.reservation.findUnique({
    where: { id },
    include: { session: { select: { id: true, programId: true, startAt: true, status: true } } },
  });
  if (!reservation) return { error: "not_found" as const };
  const owns =
    reservation.userId === auth.user.id ||
    reservation.customerEmail.toLowerCase() === auth.user.email.toLowerCase();
  if (!owns) return { error: "forbidden" as const };
  return { auth, reservation };
}

async function availableSpots(sessionId: string, capacity: number) {
  const booked = await db.reservation.count({
    where: { sessionId, status: { in: ["pending", "confirmed"] } },
  });
  return capacity - booked;
}

// GET — bu rezervasyon için taşınabilecek uygun alternatif seanslar
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await loadOwned(id);
  if ("error" in res) {
    if (res.error === "unauth") return forbidden("Giriş yapmalısınız.");
    if (res.error === "not_found") return notFound("Rezervasyon bulunamadı.");
    return forbidden("Yetkiniz yok.");
  }
  const { reservation } = res;
  if (!ACTIVE.includes(reservation.status)) return badRequest("Bu rezervasyon ertelenemez.");
  if (new Date(reservation.session.startAt) <= new Date()) return badRequest("Başlamış oturum ertelenemez.");

  try {
    const sessions = await db.workshopSession.findMany({
      where: {
        programId: reservation.session.programId,
        status: "published",
        startAt: { gt: new Date() },
        id: { not: reservation.session.id },
      },
      orderBy: { startAt: "asc" },
      take: 30,
      select: {
        id: true, startAt: true, endAt: true, locationName: true, capacity: true,
        instructor: { select: { name: true } },
        _count: { select: { reservations: { where: { status: { in: ["pending", "confirmed"] } } } } },
      },
    });
    const options = sessions
      .map((s) => ({
        id: s.id,
        startAt: s.startAt.toISOString(),
        endAt: s.endAt.toISOString(),
        locationName: s.locationName,
        instructor: s.instructor?.name ?? null,
        availableSpots: s.capacity - s._count.reservations,
      }))
      .filter((s) => s.availableSpots >= reservation.participantCount);

    return ok(options);
  } catch (err) {
    console.error("[GET reschedule]", err);
    return serverError();
  }
}

// POST — rezervasyonu hedef seansa taşı
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek."); }
  const parsed = z.object({ targetSessionId: z.string().min(1) }).safeParse(body);
  if (!parsed.success) return badRequest("Hedef oturum gerekli.");
  const { targetSessionId } = parsed.data;

  const res = await loadOwned(id);
  if ("error" in res) {
    if (res.error === "unauth") return forbidden("Giriş yapmalısınız.");
    if (res.error === "not_found") return notFound("Rezervasyon bulunamadı.");
    return forbidden("Yetkiniz yok.");
  }
  const { auth, reservation } = res;

  if (!ACTIVE.includes(reservation.status)) return badRequest("Bu rezervasyon ertelenemez.");
  if (new Date(reservation.session.startAt) <= new Date()) return badRequest("Başlamış oturum ertelenemez.");
  if (targetSessionId === reservation.session.id) return badRequest("Aynı oturum seçilemez.");

  try {
    const result = await db.$transaction(async (tx) => {
      const target = await tx.workshopSession.findUnique({
        where: { id: targetSessionId },
        include: { program: { select: { title: true } }, _count: { select: { reservations: { where: { status: { in: ["pending", "confirmed"] } } } } } },
      });
      if (!target) return { error: "target_not_found" } as const;
      if (target.programId !== reservation.session.programId) return { error: "different_program" } as const;
      if (target.status !== "published") return { error: "target_unavailable" } as const;
      if (new Date(target.startAt) <= new Date()) return { error: "target_past" } as const;

      const spots = target.capacity - target._count.reservations;
      if (spots < reservation.participantCount) return { error: "no_capacity" } as const;

      // Hedefte aynı kullanıcı/e-posta ile aktif kayıt var mı?
      const dup = await tx.reservation.findFirst({
        where: {
          sessionId: targetSessionId,
          status: { in: ["pending", "confirmed", "waitlisted"] },
          id: { not: reservation.id },
          ...(reservation.userId ? { OR: [{ userId: reservation.userId }, { customerEmail: reservation.customerEmail }] } : { customerEmail: reservation.customerEmail }),
        },
      });
      if (dup) return { error: "duplicate" } as const;

      const oldSessionId = reservation.session.id;
      await tx.reservation.update({ where: { id: reservation.id }, data: { sessionId: targetSessionId } });

      // Eski seans "full" idiyse yer açıldığı için yeniden "published"
      if (reservation.session.status === "full") {
        await tx.workshopSession.update({ where: { id: oldSessionId }, data: { status: "published" } });
      }
      // Hedef doldu ise "full"
      if (spots - reservation.participantCount === 0) {
        await tx.workshopSession.update({ where: { id: targetSessionId }, data: { status: "full" } });
      }

      const whenStr = new Intl.DateTimeFormat("tr-TR", {
        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul",
      }).format(target.startAt);
      await tx.notification.create({
        data: {
          type: "reservation",
          title: "Rezervasyon ertelendi",
          body: `${reservation.customerName}, "${target.program.title}" rezervasyonunu ${whenStr} seansına taşıdı.`,
          link: "/admin/rezervasyonlar",
        },
      });

      return { ok: true } as const;
    });

    if ("error" in result) {
      switch (result.error) {
        case "target_not_found": return notFound("Hedef oturum bulunamadı.");
        case "different_program": return badRequest("Yalnızca aynı programın oturumuna taşınabilir.");
        case "target_unavailable": return badRequest("Hedef oturum rezervasyona kapalı.");
        case "target_past": return badRequest("Geçmiş bir oturuma taşınamaz.");
        case "no_capacity": return conflict("Hedef oturumda yeterli yer yok.");
        case "duplicate": return conflict("Hedef oturumda zaten bir kaydınız var.");
      }
    }
    return ok({ id, targetSessionId }, "Rezervasyonunuz yeni tarihe taşındı.");
  } catch (err) {
    console.error("[POST reschedule]", err);
    return serverError();
  }
}
