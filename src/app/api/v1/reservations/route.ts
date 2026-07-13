import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import { db } from "@/lib/db";
import { created, badRequest, conflict, notFound, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";
import { rateLimit, getClientIp, sweep } from "@/lib/rate-limit";

// Aynı seansa ikinci kez rezervasyonu engelleyen "aktif" durumlar.
// İptal/iade/gelmedi/tamamlandı yeni rezervasyona engel olmaz.
const ACTIVE_STATUSES = ["pending", "confirmed", "waitlisted"] as const;

const reservationSchema = z.object({
  sessionId: z.string().min(1),
  customerName: z.string().min(2).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(7).max(20),
  participantCount: z.coerce.number().int().min(1).max(20),
  notes: z.string().max(500).optional().or(z.literal("")).transform((v) => v || undefined),
  giftCardCode: z.string().max(40).optional().or(z.literal("")).transform((v) => v || undefined),
});

export async function POST(request: Request) {
  sweep();
  const rl = rateLimit(`reservation:${getClientIp(request)}`, 10, 10 * 60_000);
  if (!rl.ok) {
    return new Response(
      JSON.stringify({ success: false, message: "Çok fazla rezervasyon denemesi. Lütfen biraz sonra tekrar deneyin.", errors: [] }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rl.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Geçersiz istek gövdesi.");
  }

  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const { sessionId, customerName, customerEmail, customerPhone, participantCount, notes, giftCardCode } =
    parsed.data;

  // Giriş yapmışsa rezervasyonu kullanıcı hesabına bağla (hesabım/üye geçmişi için)
  const authSession = await getSession();
  const userId = authSession?.user?.id ?? null;

  try {
    const result = await db.$transaction(async (tx) => {
      // Seans satırını kilitle — eşzamanlı rezervasyonlarda kontenjan aşımını önler.
      // Kilit, transaction sonuna kadar bu seansa yeni okuma/yazmayı sıraya sokar.
      await tx.$queryRaw`SELECT id FROM workshop_sessions WHERE id = ${sessionId} FOR UPDATE`;

      // Kilitli seansı çek ve aktif rezervasyonları say
      const session = await tx.workshopSession.findUnique({
        where: { id: sessionId },
        include: {
          program: { select: { title: true, basePrice: true, currency: true } },
          _count: {
            select: {
              reservations: { where: { status: { in: ["pending", "confirmed"] } } },
            },
          },
        },
      });

      if (!session) return { error: "not_found" } as const;
      if (session.status !== "published") return { error: "not_available" } as const;

      const bookedCount = session._count.reservations;
      const availableSpots = session.capacity - bookedCount;

      if (availableSpots < participantCount) {
        return { error: "no_capacity", available: availableSpots } as const;
      }

      // Yalnızca AYNI seansa yapılan gerçek mükerrer rezervasyonu engelle.
      // Kullanıcı (varsa) veya e-posta eşleşmesine göre; iptal/başarısız ödeme engellemez.
      const existing = await tx.reservation.findFirst({
        where: {
          sessionId,
          status: { in: [...ACTIVE_STATUSES] },
          paymentStatus: { not: "failed" },
          ...(userId ? { OR: [{ userId }, { customerEmail }] } : { customerEmail }),
        },
      });
      if (existing) return { error: "duplicate" } as const;

      const priceSnapshot = session.priceOverride ?? session.program.basePrice;
      const total = Number(priceSnapshot) * participantCount;

      // Hediye kartı uygulaması (varsa)
      let giftCardId: string | null = null;
      let giftCardAmount: number | null = null;
      if (giftCardCode) {
        const card = await tx.giftCard.findUnique({ where: { code: giftCardCode.trim().toUpperCase() } });
        if (!card) return { error: "gift_invalid" } as const;
        if (card.status === "cancelled") return { error: "gift_cancelled" } as const;
        if (card.expiresAt < new Date()) return { error: "gift_expired" } as const;
        const balance = Number(card.balance);
        if (balance <= 0) return { error: "gift_empty" } as const;

        giftCardAmount = Math.min(balance, total);
        const newBalance = balance - giftCardAmount;
        await tx.giftCard.update({
          where: { id: card.id },
          data: { balance: newBalance, status: newBalance <= 0 ? "depleted" : "active" },
        });
        giftCardId = card.id;
      }

      const reservation = await tx.reservation.create({
        data: {
          sessionId,
          userId,
          customerName,
          customerEmail,
          customerPhone,
          participantCount,
          priceSnapshot,
          currency: session.program.currency,
          status: "pending",
          paymentStatus: "not_required",
          notes: notes ?? null,
          giftCardId,
          giftCardAmount,
        },
        select: {
          id: true,
          status: true,
          customerEmail: true,
          priceSnapshot: true,
          participantCount: true,
          giftCardAmount: true,
        },
      });

      // Mark session as full if needed
      if (availableSpots - participantCount === 0) {
        await tx.workshopSession.update({
          where: { id: sessionId },
          data: { status: "full" },
        });
      }

      // Admin bildirimi oluştur
      const whenStr = new Intl.DateTimeFormat("tr-TR", {
        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
        timeZone: "Europe/Istanbul",
      }).format(session.startAt);
      await tx.notification.create({
        data: {
          type: "reservation",
          title: "Yeni rezervasyon",
          body: `${customerName}, "${session.program.title}" için ${whenStr} seansına ${participantCount} kişilik rezervasyon yaptı.`,
          link: "/admin/rezervasyonlar",
        },
      });

      return { reservation };
    });

    if ("error" in result) {
      switch (result.error) {
        case "not_found":
          return notFound("Oturum bulunamadı.");
        case "not_available":
          return badRequest("Bu oturum artık rezervasyona açık değil.");
        case "no_capacity":
          return conflict(
            `Yeterli kontenjan yok. Kalan yer: ${result.available}`
          );
        case "duplicate":
          return conflict("Bu e-posta adresiyle bu oturum için zaten bir rezervasyon mevcut.");
        case "gift_invalid":
          return badRequest("Hediye kartı kodu bulunamadı.");
        case "gift_cancelled":
          return badRequest("Bu hediye kartı iptal edilmiş.");
        case "gift_expired":
          return badRequest("Bu hediye kartının süresi dolmuş.");
        case "gift_empty":
          return badRequest("Bu hediye kartının bakiyesi kalmamış.");
      }
    }

    return created(result.reservation, "Rezervasyonunuz başarıyla oluşturuldu.");
  } catch (err) {
    // Kısmi unique index (aynı seans+e-posta, aktif durum) ihlali → mükerrer
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return conflict("Bu e-posta adresiyle bu oturum için zaten aktif bir rezervasyon mevcut.");
    }
    console.error("[POST /api/v1/reservations]", err);
    return serverError();
  }
}
