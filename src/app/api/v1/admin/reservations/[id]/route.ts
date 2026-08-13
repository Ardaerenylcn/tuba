import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badRequest, forbidden, notFound, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

/** Kontenjanı dolduran durumlar. Bekleme listesi ve iptaller saymaz. */
const OCCUPYING = ["pending", "confirmed"] as const;

const patchSchema = z
  .object({
    status: z.enum(["pending", "confirmed", "cancelled", "no_show", "completed", "waitlisted"]).optional(),
    /** Ödeme elle işaretlenebilir: iyzico entegrasyonu hazır değil, tahsilat atölyede yapılıyor. */
    paymentStatus: z
      .enum(["not_required", "pending", "paid", "failed", "refunded", "partially_refunded"])
      .optional(),
    cancellationReason: z.string().max(500).optional(),
  })
  .refine((d) => d.status !== undefined || d.paymentStatus !== undefined, {
    message: "Güncellenecek alan yok.",
  });

async function checkAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "admin" && session.user.role !== "editor") return null;
  return session;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAdmin();
  if (!auth) return forbidden();

  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek."); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const { status, paymentStatus, cancellationReason } = parsed.data;

  try {
    const result = await db.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id },
        include: { session: { select: { id: true, status: true, capacity: true } } },
      });
      if (!reservation) return { error: "not_found" as const };

      // Bu rezervasyon HARİÇ dolu kontenjan. Kontenjan kişi cinsindendir,
      // bu yüzden satır sayısı değil participantCount toplamı alınır.
      const others = await tx.reservation.findMany({
        where: {
          sessionId: reservation.sessionId,
          status: { in: [...OCCUPYING] },
          id: { not: id },
        },
        select: { participantCount: true },
      });
      const bookedByOthers = others.reduce((a, r) => a + r.participantCount, 0);

      const wasActive = (OCCUPYING as readonly string[]).includes(reservation.status);
      const nextStatus = status ?? reservation.status;
      const willBeActive = (OCCUPYING as readonly string[]).includes(nextStatus);

      // Pasif → aktif geçişte (ör. bekleme listesinden alma) kontenjan aşılamaz.
      if (!wasActive && willBeActive) {
        const room = reservation.session.capacity - bookedByOthers;
        if (reservation.participantCount > room) {
          return {
            error: "no_room" as const,
            room: Math.max(0, room),
            needed: reservation.participantCount,
          };
        }
      }

      const isCancelling = nextStatus === "cancelled";
      const updated = await tx.reservation.update({
        where: { id },
        data: {
          ...(status !== undefined ? { status } : {}),
          ...(paymentStatus !== undefined ? { paymentStatus } : {}),
          ...(isCancelling
            ? { cancelledAt: new Date(), cancellationReason: cancellationReason ?? null }
            : {}),
        },
      });

      // Oturumun "dolu" durumu türetilmiş bir bilgidir; her değişimde
      // yeniden hesaplanır, yoksa iptal/onay sonrası bayat kalıyor.
      const bookedNow = bookedByOthers + (willBeActive ? reservation.participantCount : 0);
      let sessionStatus = reservation.session.status;
      if (bookedNow >= reservation.session.capacity && sessionStatus === "published") {
        await tx.workshopSession.update({ where: { id: reservation.sessionId }, data: { status: "full" } });
        sessionStatus = "full";
      } else if (bookedNow < reservation.session.capacity && sessionStatus === "full") {
        await tx.workshopSession.update({ where: { id: reservation.sessionId }, data: { status: "published" } });
        sessionStatus = "published";
      }

      return { reservation: updated, bookedNow, capacity: reservation.session.capacity, sessionStatus };
    });

    if ("error" in result) {
      if (result.error === "not_found") return notFound("Rezervasyon bulunamadı.");
      return badRequest(
        result.room === 0
          ? "Oturum dolu, bu rezervasyon aktifleştirilemez."
          : `Oturumda ${result.room} kişilik yer var, bu rezervasyon ${result.needed} kişilik.`,
      );
    }

    const parts = ["Rezervasyon güncellendi."];
    if (result.sessionStatus === "full") parts.push("Oturum doldu.");
    return ok(result.reservation, parts.join(" "));
  } catch (err) {
    console.error("[PATCH /api/v1/admin/reservations/:id]", err);
    return serverError();
  }
}
