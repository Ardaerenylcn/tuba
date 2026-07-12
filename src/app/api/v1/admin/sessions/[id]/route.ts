import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badRequest, forbidden, notFound, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";
import { findSessionConflicts, conflictMessage } from "@/lib/session-conflicts";

const patchSchema = z.object({
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  capacity: z.number().int().min(1).optional(),
  status: z.enum(["draft", "published", "cancelled", "completed"]).optional(),
  priceOverride: z.number().min(0).optional().nullable(),
  locationName: z.string().max(200).optional().nullable(),
  locationAddress: z.string().max(500).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
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

  try {
    const existing = await db.workshopSession.findUnique({ where: { id } });
    if (!existing) return notFound("Oturum bulunamadı.");

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.startAt) data.startAt = new Date(parsed.data.startAt);
    if (parsed.data.endAt) data.endAt = new Date(parsed.data.endAt);

    if (data.startAt && data.endAt && new Date(data.endAt as string) <= new Date(data.startAt as string)) {
      return badRequest("Bitiş saati başlangıçtan sonra olmalı.");
    }

    const workshopSession = await db.workshopSession.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            reservations: { where: { status: { in: ["pending", "confirmed"] } } },
          },
        },
      },
    });

    // Çakışma uyarısı (aynı mekân/eğitmen + zaman)
    const conflicts = await findSessionConflicts({
      startAt: workshopSession.startAt,
      endAt: workshopSession.endAt,
      locationName: workshopSession.locationName,
      instructorId: workshopSession.instructorId,
      excludeId: workshopSession.id,
    });

    // Tarih/saat değişip aktif katılımcı varsa ek uyarı
    const timeChanged = Boolean(parsed.data.startAt || parsed.data.endAt);
    const parts: string[] = ["Oturum güncellendi."];
    if (timeChanged && workshopSession._count.reservations > 0) {
      parts.push(`⚠ Bu oturumda ${workshopSession._count.reservations} aktif katılımcı var; tarih/saat değişikliğinden etkilenirler.`);
    }
    if (conflicts.length > 0) parts.push(conflictMessage(conflicts));

    return ok({ ...workshopSession, conflicts }, parts.join(" "));
  } catch (err) {
    console.error("[PATCH /api/v1/admin/sessions/:id]", err);
    return serverError();
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAdmin();
  if (!auth) return forbidden();

  const { id } = await params;

  try {
    const existing = await db.workshopSession.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            reservations: { where: { status: { in: ["pending", "confirmed"] } } },
          },
        },
      },
    });
    if (!existing) return notFound("Oturum bulunamadı.");

    if (existing._count.reservations > 0) {
      return badRequest(
        `Bu oturumda ${existing._count.reservations} aktif rezervasyon var. Önce rezervasyonları iptal edin.`
      );
    }

    // FK kısıtlaması: önce bağlı kayıtları sil (cancelled/completed dahil)
    await db.$transaction(async (tx) => {
      const sessionReservations = await tx.reservation.findMany({
        where: { sessionId: id },
        select: { id: true },
      });
      if (sessionReservations.length > 0) {
        await tx.payment.deleteMany({
          where: { reservationId: { in: sessionReservations.map((r) => r.id) } },
        });
        await tx.reservation.deleteMany({ where: { sessionId: id } });
      }
      await tx.workshopSession.delete({ where: { id } });
    });

    return ok(null, "Oturum silindi.");
  } catch (err) {
    console.error("[DELETE /api/v1/admin/sessions/:id]", err);
    return serverError();
  }
}
