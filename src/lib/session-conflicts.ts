import { db } from "@/lib/db";

export interface ConflictInput {
  startAt: Date;
  endAt: Date;
  locationName?: string | null;
  instructorId?: string | null;
  excludeId?: string;
}

export interface SessionConflict {
  id: string;
  programTitle: string;
  startAt: string;
  endAt: string;
  reason: "location" | "instructor";
}

/**
 * Aynı mekânda veya aynı eğitmenle zaman çakışması olan (iptal olmayan)
 * oturumları döner. Engelleyici değildir — yalnızca uyarı amaçlıdır.
 */
export async function findSessionConflicts(input: ConflictInput): Promise<SessionConflict[]> {
  const { startAt, endAt, locationName, instructorId, excludeId } = input;

  // Aynı mekân veya aynı eğitmen filtresi (ikisi de yoksa çakışma aranmaz)
  const orClauses = [];
  if (locationName) orClauses.push({ locationName });
  if (instructorId) orClauses.push({ instructorId });
  if (orClauses.length === 0) return [];

  const overlapping = await db.workshopSession.findMany({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      status: { not: "cancelled" },
      // Zaman aralığı çakışması: start < other.end && end > other.start
      startAt: { lt: endAt },
      endAt: { gt: startAt },
      OR: orClauses,
    },
    select: {
      id: true,
      startAt: true,
      endAt: true,
      locationName: true,
      instructorId: true,
      program: { select: { title: true } },
    },
    take: 10,
  });

  return overlapping.map((s) => ({
    id: s.id,
    programTitle: s.program.title,
    startAt: s.startAt.toISOString(),
    endAt: s.endAt.toISOString(),
    reason: instructorId && s.instructorId === instructorId ? "instructor" : "location",
  }));
}

/** Uyarı mesajını insan-okur biçime çevirir. */
export function conflictMessage(conflicts: SessionConflict[]): string {
  if (conflicts.length === 0) return "";
  const hasLoc = conflicts.some((c) => c.reason === "location");
  const hasIns = conflicts.some((c) => c.reason === "instructor");
  const parts: string[] = [];
  if (hasLoc) parts.push("aynı mekânda");
  if (hasIns) parts.push("aynı eğitmenle");
  return `⚠ Dikkat: Bu saatlerde ${parts.join(" ve ")} çakışan ${conflicts.length} oturum var.`;
}
