import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badRequest, forbidden, notFound, serverError, handleZodError, conflict } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

/** Kontenjanı dolduran durumlar. Bekleme listesi ve iptaller saymaz. */
const OCCUPYING = ["pending", "confirmed"] as const;

/**
 * Kısmi unique index'in kapsadığı durumlar:
 *   reservations_active_session_email_unique ON (sessionId, customerEmail)
 *   WHERE status IN ('pending','confirmed','waitlisted')
 * Aynı kişiyi aynı oturumda ikinci kez aktif tutmayı DB seviyesinde engeller.
 */
const INDEXED_STATUSES = ["pending", "confirmed", "waitlisted"] as const;

const patchSchema = z
  .object({
    status: z.enum(["pending", "confirmed", "cancelled", "no_show", "completed", "waitlisted"]).optional(),
    /** Ödeme elle işaretlenebilir: iyzico entegrasyonu hazır değil, tahsilat atölyede yapılıyor. */
    paymentStatus: z
      .enum(["not_required", "pending", "paid", "failed", "refunded", "partially_refunded"])
      .optional(),
    cancellationReason: z.string().max(500).optional(),
    // Katılımcı bilgileri
    customerName: z.string().min(2).max(200).optional(),
    customerEmail: z.string().email().max(200).optional(),
    customerPhone: z.string().min(5).max(40).optional(),
    participantCount: z.number().int().min(1).max(50).optional(),
    notes: z.string().max(1000).optional().nullable(),
    /** Başka bir oturuma aktarma. */
    sessionId: z.string().min(1).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: "Güncellenecek alan yok." });

async function checkAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "admin" && session.user.role !== "editor") return null;
  return session;
}

/** Bir oturumun dolu kontenjanı — kişi sayısı toplamı, satır sayısı değil. */
async function bookedFor(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  sessionId: string,
  excludeReservationId?: string,
) {
  const rows = await tx.reservation.findMany({
    where: {
      sessionId,
      status: { in: [...OCCUPYING] },
      ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
    },
    select: { participantCount: true },
  });
  return rows.reduce((a, r) => a + r.participantCount, 0);
}

/** Oturumun "dolu" durumunu gerçek doluluğa göre günceller. */
async function syncSessionFullness(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  sessionId: string,
) {
  const s = await tx.workshopSession.findUnique({
    where: { id: sessionId },
    select: { capacity: true, status: true },
  });
  if (!s) return null;
  const booked = await bookedFor(tx, sessionId);
  if (booked >= s.capacity && s.status === "published") {
    await tx.workshopSession.update({ where: { id: sessionId }, data: { status: "full" } });
    return "full";
  }
  if (booked < s.capacity && s.status === "full") {
    await tx.workshopSession.update({ where: { id: sessionId }, data: { status: "published" } });
    return "published";
  }
  return s.status;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAdmin();
  if (!auth) return forbidden();

  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek."); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const d = parsed.data;

  try {
    const result = await db.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id },
        include: { session: { select: { id: true, status: true, capacity: true } } },
      });
      if (!reservation) return { error: "not_found" as const };

      const nextStatus = d.status ?? reservation.status;
      const nextCount = d.participantCount ?? reservation.participantCount;
      const nextEmail = d.customerEmail ?? reservation.customerEmail;
      const targetSessionId = d.sessionId ?? reservation.sessionId;
      const isTransfer = targetSessionId !== reservation.sessionId;

      const wasActive = (OCCUPYING as readonly string[]).includes(reservation.status);
      const willBeActive = (OCCUPYING as readonly string[]).includes(nextStatus);

      // Hedef oturum (aktarma varsa) doğrulanır.
      const target = isTransfer
        ? await tx.workshopSession.findUnique({
            where: { id: targetSessionId },
            select: { id: true, capacity: true, status: true },
          })
        : reservation.session;
      if (!target) return { error: "target_not_found" as const };

      // Kontenjan kontrolü: aktarma, kişi sayısı artışı ve pasif→aktif geçişi
      // hepsi hedefte yer gerektirir.
      if (willBeActive) {
        const bookedByOthers = await bookedFor(tx, target.id, isTransfer ? undefined : id);
        const room = target.capacity - bookedByOthers;
        if (nextCount > room) {
          return { error: "no_room" as const, room: Math.max(0, room), needed: nextCount };
        }
      }

      // Kısmi unique index'e düşmeden önce anlaşılır kontrol: aynı oturumda
      // aynı e-postayla başka bir aktif kayıt var mı?
      if ((INDEXED_STATUSES as readonly string[]).includes(nextStatus)) {
        const clash = await tx.reservation.findFirst({
          where: {
            sessionId: target.id,
            customerEmail: nextEmail,
            status: { in: [...INDEXED_STATUSES] },
            id: { not: id },
          },
          select: { id: true },
        });
        if (clash) return { error: "duplicate" as const, email: nextEmail };
      }

      const isCancelling = nextStatus === "cancelled";
      const updated = await tx.reservation.update({
        where: { id },
        data: {
          ...(d.status !== undefined ? { status: d.status } : {}),
          ...(d.paymentStatus !== undefined ? { paymentStatus: d.paymentStatus } : {}),
          ...(d.customerName !== undefined ? { customerName: d.customerName } : {}),
          ...(d.customerEmail !== undefined ? { customerEmail: d.customerEmail } : {}),
          ...(d.customerPhone !== undefined ? { customerPhone: d.customerPhone } : {}),
          ...(d.participantCount !== undefined ? { participantCount: d.participantCount } : {}),
          ...(d.notes !== undefined ? { notes: d.notes } : {}),
          // Aktarmada priceSnapshot korunur: kişinin ödediği/anlaşılan tutar
          // hedef oturumun fiyatıyla kendiliğinden değişmemeli.
          ...(isTransfer ? { sessionId: target.id } : {}),
          ...(isCancelling
            ? { cancelledAt: new Date(), cancellationReason: d.cancellationReason ?? null }
            : {}),
        },
      });

      // Doluluk türetilmiş bilgi: hem kaynak hem hedef oturum yeniden senkronlanır.
      const targetStatus = await syncSessionFullness(tx, target.id);
      if (isTransfer) await syncSessionFullness(tx, reservation.sessionId);

      return { reservation: updated, isTransfer, targetStatus, wasActive, willBeActive };
    });

    if ("error" in result) {
      if (result.error === "not_found") return notFound("Rezervasyon bulunamadı.");
      if (result.error === "target_not_found") return badRequest("Hedef oturum bulunamadı.");
      if (result.error === "duplicate") {
        return conflict(`${result.email} bu oturumda zaten kayıtlı. Aynı kişi aynı oturuma iki kez eklenemez.`);
      }
      return badRequest(
        result.room === 0
          ? "Oturum dolu, bu rezervasyon aktifleştirilemez."
          : `Oturumda ${result.room} kişilik yer var, bu rezervasyon ${result.needed} kişilik.`,
      );
    }

    const parts = [result.isTransfer ? "Katılımcı yeni oturuma aktarıldı." : "Rezervasyon güncellendi."];
    if (result.targetStatus === "full") parts.push("Oturum doldu.");
    return ok(result.reservation, parts.join(" "));
  } catch (err) {
    // Kısmi unique index yine de tetiklenirse (yarış koşulu) anlaşılır mesaj.
    if (typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002") {
      return conflict("Bu kişi bu oturumda zaten kayıtlı.");
    }
    console.error("[PATCH /api/v1/admin/reservations/:id]", err);
    return serverError();
  }
}
