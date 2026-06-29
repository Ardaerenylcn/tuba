import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badRequest, forbidden, notFound, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const patchSchema = z.object({
  status: z.enum(["confirmed", "cancelled", "no_show", "completed", "waitlisted"]),
  cancellationReason: z.string().max(500).optional(),
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

  const { status, cancellationReason } = parsed.data;

  try {
    const result = await db.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id },
        include: {
          session: { select: { id: true, status: true, capacity: true } },
          _count: { select: { payments: true } },
        },
      });

      if (!reservation) return { error: "not_found" } as const;

      const wasActive = ["pending", "confirmed"].includes(reservation.status);
      const isCancelling = status === "cancelled";

      const updated = await tx.reservation.update({
        where: { id },
        data: {
          status,
          ...(isCancelling
            ? {
                cancelledAt: new Date(),
                cancellationReason: cancellationReason ?? null,
              }
            : {}),
        },
      });

      // Restore session capacity when cancelling an active reservation
      if (isCancelling && wasActive && reservation.session.status === "full") {
        // Count remaining active reservations after this cancellation
        const remaining = await tx.reservation.count({
          where: {
            sessionId: reservation.session.id,
            status: { in: ["pending", "confirmed"] },
            id: { not: id },
          },
        });

        if (remaining < reservation.session.capacity) {
          await tx.workshopSession.update({
            where: { id: reservation.session.id },
            data: { status: "published" },
          });
        }
      }

      return { reservation: updated };
    });

    if ("error" in result) return notFound("Rezervasyon bulunamadı.");

    return ok(result.reservation, "Rezervasyon güncellendi.");
  } catch (err) {
    console.error("[PATCH /api/v1/admin/reservations/:id]", err);
    return serverError();
  }
}
