import { db } from "@/lib/db";
import { ok, badRequest, forbidden, notFound, serverError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const ACTIVE = ["pending", "confirmed", "waitlisted"];

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getSession();
  if (!auth) return forbidden("Giriş yapmalısınız.");

  const { id } = await params;

  try {
    const reservation = await db.reservation.findUnique({
      where: { id },
      include: { session: { select: { id: true, startAt: true, status: true } } },
    });
    if (!reservation) return notFound("Rezervasyon bulunamadı.");

    // Sahiplik: kullanıcı kimliği veya e-posta eşleşmesi
    const owns =
      reservation.userId === auth.user.id ||
      reservation.customerEmail.toLowerCase() === auth.user.email.toLowerCase();
    if (!owns) return forbidden("Bu rezervasyonu iptal etme yetkiniz yok.");

    if (!ACTIVE.includes(reservation.status)) {
      return badRequest("Bu rezervasyon zaten iptal edilmiş veya tamamlanmış.");
    }
    if (new Date(reservation.session.startAt) <= new Date()) {
      return badRequest("Başlamış veya geçmiş bir oturum iptal edilemez.");
    }

    await db.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id },
        data: { status: "cancelled", cancelledAt: new Date(), cancellationReason: "Kullanıcı tarafından iptal edildi." },
      });

      // Kontenjan iadesi: oturum "full" ise tekrar "published"
      if (reservation.session.status === "full") {
        await tx.workshopSession.update({ where: { id: reservation.session.id }, data: { status: "published" } });

        // Bekleme listesinde kişi varsa admini bilgilendir (yer açıldı)
        const waitingCount = await tx.reservation.count({
          where: { sessionId: reservation.session.id, status: "waitlisted" },
        });
        if (waitingCount > 0) {
          await tx.notification.create({
            data: {
              type: "reservation",
              title: "Bekleme listesinde yer açıldı",
              body: `Bir iptal sonrası yer açıldı; bu seansın bekleme listesinde ${waitingCount} kişi var. Onaylamak için rezervasyonlara bakın.`,
              link: "/admin/rezervasyonlar?status=waitlisted",
            },
          });
        }
      }

      // Hediye kartı kullanıldıysa bakiyeyi iade et
      if (reservation.giftCardId && reservation.giftCardAmount) {
        const card = await tx.giftCard.findUnique({ where: { id: reservation.giftCardId } });
        if (card && card.status !== "cancelled") {
          const restored = Number(card.balance) + Number(reservation.giftCardAmount);
          await tx.giftCard.update({
            where: { id: card.id },
            data: { balance: restored, status: card.expiresAt > new Date() ? "active" : card.status },
          });
        }
      }
    });

    return ok({ id, status: "cancelled" }, "Rezervasyonunuz iptal edildi.");
  } catch (err) {
    console.error("[POST /api/v1/reservations/:id/cancel]", err);
    return serverError();
  }
}
