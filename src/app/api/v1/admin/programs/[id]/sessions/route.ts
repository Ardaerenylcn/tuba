import { z } from "zod";
import { db } from "@/lib/db";
import { ok, created, badRequest, forbidden, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";
import { findSessionConflicts, conflictMessage } from "@/lib/session-conflicts";

const createSchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  capacity: z.number().int().min(1),
  status: z.enum(["draft", "published", "cancelled"]).default("draft"),
  priceOverride: z.number().min(0).optional().nullable(),
  locationName: z.string().max(200).optional().nullable(),
  locationAddress: z.string().max(500).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
}).refine((d) => new Date(d.endAt) > new Date(d.startAt), {
  message: "Bitiş saati başlangıçtan sonra olmalı.",
  path: ["endAt"],
});

async function checkAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "admin" && session.user.role !== "editor") return null;
  return session;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAdmin();
  if (!auth) return forbidden();

  const { id } = await params;

  try {
    const sessions = await db.workshopSession.findMany({
      where: { programId: id },
      orderBy: { startAt: "asc" },
      include: {
        instructor: { select: { id: true, name: true } },
        _count: {
          select: {
            reservations: { where: { status: { in: ["pending", "confirmed"] } } },
          },
        },
      },
    });
    return ok(sessions);
  } catch (err) {
    console.error("[GET /api/v1/admin/programs/:id/sessions]", err);
    return serverError();
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAdmin();
  if (!auth) return forbidden();

  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek."); }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  try {
    const program = await db.program.findUnique({ where: { id } });
    if (!program) return badRequest("Program bulunamadı.");

    const workshopSession = await db.workshopSession.create({
      data: {
        programId: id,
        startAt: new Date(parsed.data.startAt),
        endAt: new Date(parsed.data.endAt),
        capacity: parsed.data.capacity,
        status: parsed.data.status,
        priceOverride: parsed.data.priceOverride ?? null,
        locationName: parsed.data.locationName ?? null,
        locationAddress: parsed.data.locationAddress ?? null,
        notes: parsed.data.notes ?? null,
      },
      include: {
        _count: {
          select: {
            reservations: { where: { status: { in: ["pending", "confirmed"] } } },
          },
        },
      },
    });

    const conflicts = await findSessionConflicts({
      startAt: workshopSession.startAt,
      endAt: workshopSession.endAt,
      locationName: workshopSession.locationName,
      instructorId: workshopSession.instructorId,
      excludeId: workshopSession.id,
    });
    const msg = conflicts.length > 0 ? `Oturum oluşturuldu. ${conflictMessage(conflicts)}` : "Oturum oluşturuldu.";

    return created({ ...workshopSession, conflicts }, msg);
  } catch (err) {
    console.error("[POST /api/v1/admin/programs/:id/sessions]", err);
    return serverError();
  }
}
