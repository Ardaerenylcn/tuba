import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import { db } from "@/lib/db";
import { created, badRequest, conflict, notFound, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";
import { rateLimit, getClientIp, sweep } from "@/lib/rate-limit";

// Aktif sayılan durumlar: bunlardan biri varsa aynı seansa tekrar (waitlist dahil) engellenir.
const ACTIVE_STATUSES = ["pending", "confirmed", "waitlisted"] as const;

const schema = z.object({
  sessionId: z.string().min(1),
  customerName: z.string().min(2).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(7).max(20),
  participantCount: z.coerce.number().int().min(1).max(20).default(1),
  notes: z.string().max(500).optional().or(z.literal("")).transform((v) => v || undefined),
});

export async function POST(request: Request) {
  sweep();
  const rl = rateLimit(`waitlist:${getClientIp(request)}`, 10, 10 * 60_000);
  if (!rl.ok) {
    return new Response(
      JSON.stringify({ success: false, message: "Çok fazla deneme. Lütfen biraz sonra tekrar deneyin.", errors: [] }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rl.retryAfter) } }
    );
  }

  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek gövdesi."); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);
  const { sessionId, customerName, customerEmail, customerPhone, participantCount, notes } = parsed.data;

  const authSession = await getSession();
  const userId = authSession?.user?.id ?? null;

  try {
    const result = await db.$transaction(async (tx) => {
      const session = await tx.workshopSession.findUnique({
        where: { id: sessionId },
        include: { program: { select: { title: true, basePrice: true, currency: true } } },
      });
      if (!session) return { error: "not_found" } as const;
      if (session.status !== "published" && session.status !== "full") {
        return { error: "not_available" } as const;
      }

      const existing = await tx.reservation.findFirst({
        where: {
          sessionId,
          status: { in: [...ACTIVE_STATUSES] },
          paymentStatus: { not: "failed" },
          ...(userId ? { OR: [{ userId }, { customerEmail }] } : { customerEmail }),
        },
      });
      if (existing) return { error: "duplicate" } as const;

      const reservation = await tx.reservation.create({
        data: {
          sessionId,
          userId,
          customerName,
          customerEmail,
          customerPhone,
          participantCount,
          priceSnapshot: session.priceOverride ?? session.program.basePrice,
          currency: session.program.currency,
          status: "waitlisted",
          paymentStatus: "not_required",
          notes: notes ?? null,
        },
        select: { id: true, status: true },
      });

      const whenStr = new Intl.DateTimeFormat("tr-TR", {
        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
        timeZone: "Europe/Istanbul",
      }).format(session.startAt);
      await tx.notification.create({
        data: {
          type: "reservation",
          title: "Bekleme listesine yeni kayıt",
          body: `${customerName}, "${session.program.title}" için ${whenStr} (dolu) seansının bekleme listesine katıldı.`,
          link: "/admin/rezervasyonlar?status=waitlisted",
        },
      });

      return { reservation };
    });

    if ("error" in result) {
      switch (result.error) {
        case "not_found": return notFound("Oturum bulunamadı.");
        case "not_available": return badRequest("Bu oturum bekleme listesine uygun değil.");
        case "duplicate": return conflict("Bu e-posta adresiyle bu oturum için zaten bir kaydınız var.");
      }
    }

    return created(result.reservation, "Bekleme listesine eklendiniz. Yer açılırsa sizi bilgilendireceğiz.");
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return conflict("Bu e-posta adresiyle bu oturum için zaten aktif bir kaydınız var.");
    }
    console.error("[POST /api/v1/reservations/waitlist]", err);
    return serverError();
  }
}
