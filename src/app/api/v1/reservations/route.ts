import { z } from "zod";
import { db } from "@/lib/db";
import { ok, created, badRequest, conflict, notFound, serverError, handleZodError } from "@/lib/api";

const reservationSchema = z.object({
  sessionId: z.string().min(1),
  customerName: z.string().min(2).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(7).max(20),
  participantCount: z.coerce.number().int().min(1).max(20),
  notes: z.string().max(500).optional().or(z.literal("")).transform((v) => v || undefined),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Geçersiz istek gövdesi.");
  }

  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const { sessionId, customerName, customerEmail, customerPhone, participantCount, notes } =
    parsed.data;

  try {
    const result = await db.$transaction(async (tx) => {
      // Lock the session and count active reservations
      const session = await tx.workshopSession.findUnique({
        where: { id: sessionId },
        include: {
          program: { select: { basePrice: true, currency: true } },
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

      // Prevent duplicate reservation from same email for same session
      const existing = await tx.reservation.findFirst({
        where: {
          sessionId,
          customerEmail,
          status: { in: ["pending", "confirmed"] },
        },
      });
      if (existing) return { error: "duplicate" } as const;

      const priceSnapshot = session.priceOverride ?? session.program.basePrice;

      const reservation = await tx.reservation.create({
        data: {
          sessionId,
          customerName,
          customerEmail,
          customerPhone,
          participantCount,
          priceSnapshot,
          currency: session.program.currency,
          status: "pending",
          paymentStatus: "not_required",
          notes: notes ?? null,
        },
        select: {
          id: true,
          status: true,
          customerEmail: true,
          priceSnapshot: true,
          participantCount: true,
        },
      });

      // Mark session as full if needed
      if (availableSpots - participantCount === 0) {
        await tx.workshopSession.update({
          where: { id: sessionId },
          data: { status: "full" },
        });
      }

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
      }
    }

    return created(result.reservation, "Rezervasyonunuz başarıyla oluşturuldu.");
  } catch (err) {
    console.error("[POST /api/v1/reservations]", err);
    return serverError();
  }
}
