import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badRequest, forbidden, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";
import { validateInstructor } from "@/lib/instructor";

const bulkSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  capacity: z.number().int().min(1),
  status: z.enum(["draft", "published"]).default("published"),
  priceOverride: z.number().min(0).optional().nullable(),
  locationName: z.string().max(200).optional().nullable(),
  instructorId: z.string().optional().nullable(),
}).refine((d) => d.endDate >= d.startDate, {
  message: "Bitiş tarihi başlangıçtan önce olamaz.",
  path: ["endDate"],
}).refine((d) => d.endTime > d.startTime, {
  message: "Bitiş saati başlangıçtan sonra olmalı.",
  path: ["endTime"],
});

function buildUTC(dateStr: string, timeStr: string): Date {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, m] = timeStr.split(":").map(Number);
  // Istanbul is UTC+3 (no DST since 2016)
  return new Date(Date.UTC(y, mo - 1, d, h - 3, m, 0, 0));
}

async function checkAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "admin" && session.user.role !== "editor") return null;
  return session;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAdmin();
  if (!auth) return forbidden();

  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek."); }

  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const program = await db.program.findUnique({ where: { id } });
  if (!program) return badRequest("Program bulunamadı.");

  const { startDate, endDate, daysOfWeek, startTime, endTime, capacity, status, priceOverride, locationName, instructorId } = parsed.data;

  const instructorCheck = await validateInstructor(instructorId);
  if (!instructorCheck.ok) return badRequest(instructorCheck.message);

  const daySet = new Set(daysOfWeek);
  const sessions: { programId: string; startAt: Date; endAt: Date; capacity: number; status: string; priceOverride: unknown; locationName: string | null | undefined; instructorId: string | null }[] = [];

  const cursor = new Date(`${startDate}T00:00:00Z`);
  const last = new Date(`${endDate}T00:00:00Z`);

  // Guard: max 366 days to prevent runaway loops
  const maxDays = 366;
  let dayCount = 0;

  while (cursor <= last && dayCount < maxDays) {
    const dateStr = cursor.toISOString().slice(0, 10);
    // Day of week in Istanbul: since UTC midnight in Istanbul is +3h (still same day), use UTC day
    const dow = cursor.getUTCDay();

    if (daySet.has(dow)) {
      sessions.push({
        programId: id,
        startAt: buildUTC(dateStr, startTime),
        endAt: buildUTC(dateStr, endTime),
        capacity,
        status,
        priceOverride: priceOverride ?? null,
        locationName: locationName ?? null,
        instructorId: instructorId || null,
      });
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
    dayCount++;
  }

  if (sessions.length === 0) {
    return badRequest("Seçilen tarih aralığında ve günlerde hiç oturum oluşturulamadı.");
  }

  if (sessions.length > 200) {
    return badRequest("Tek seferde en fazla 200 oturum oluşturulabilir.");
  }

  try {
    const result = await db.workshopSession.createMany({ data: sessions as Parameters<typeof db.workshopSession.createMany>[0] extends { data: infer D } ? D : never });
    return ok({ count: result.count }, `${result.count} oturum oluşturuldu.`);
  } catch (err) {
    console.error("[POST /api/v1/admin/programs/:id/sessions/bulk]", err);
    return serverError();
  }
}
