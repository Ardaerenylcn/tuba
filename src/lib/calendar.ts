import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma";

/** Kontenjanı dolduran rezervasyon durumları. Bekleme listesi kontenjana sayılmaz. */
export const OCCUPYING_STATUSES = ["pending", "confirmed"] as const;

export type CalendarViewMode = "month" | "week" | "day" | "list";

export interface CalendarEvent {
  id: string;
  programId: string;
  programTitle: string;
  programType: string;
  programSlug: string;
  startAt: string;
  endAt: string;
  status: string;
  capacity: number;
  /** Dolu kontenjan — rezervasyon satırı değil, katılımcı sayısı toplamı. */
  booked: number;
  waitlisted: number;
  instructorId: string | null;
  instructorName: string | null;
  locationName: string | null;
  price: number;
  currency: string;
  notes: string | null;
}

export interface CalendarFilters {
  type?: string;
  instructorId?: string;
  location?: string;
  status?: string;
  /** empty | partial | full */
  occupancy?: string;
  search?: string;
}

/**
 * Takvim etkinlikleri.
 *
 * Etkinlik = `WorkshopSession`, yani bir programın tarihli örneği. Program
 * bilgileri (ad, tür, fiyat) programdan okunur; takvim onları kopyalamaz.
 *
 * Doluluk `participantCount` toplamıdır: bir rezervasyon birden fazla kişilik
 * olabilir, satır saymak yanlış sonuç verir.
 */
export async function getCalendarEvents(
  from: Date,
  to: Date,
  filters: CalendarFilters = {},
): Promise<CalendarEvent[]> {
  const where: Prisma.WorkshopSessionWhereInput = {
    startAt: { gte: from, lt: to },
  };

  if (filters.type) where.program = { type: filters.type };
  if (filters.instructorId) where.instructorId = filters.instructorId;
  if (filters.location) where.locationName = { contains: filters.location, mode: "insensitive" };
  if (filters.status) where.status = filters.status as Prisma.EnumSessionStatusFilter["equals"];

  // Arama hem programa hem katılımcıya bakar (ad, telefon, e-posta).
  if (filters.search) {
    const q = filters.search.trim();
    if (q) {
      where.OR = [
        { program: { title: { contains: q, mode: "insensitive" } } },
        { locationName: { contains: q, mode: "insensitive" } },
        {
          reservations: {
            some: {
              OR: [
                { customerName: { contains: q, mode: "insensitive" } },
                { customerEmail: { contains: q, mode: "insensitive" } },
                { customerPhone: { contains: q, mode: "insensitive" } },
              ],
            },
          },
        },
      ];
    }
  }

  const sessions = await db.workshopSession.findMany({
    where,
    orderBy: { startAt: "asc" },
    include: {
      program: { select: { id: true, title: true, type: true, slug: true, basePrice: true, currency: true } },
      instructor: { select: { id: true, name: true } },
      reservations: {
        select: { status: true, participantCount: true },
      },
    },
  });

  const events = sessions.map((s) => {
    let booked = 0;
    let waitlisted = 0;
    for (const r of s.reservations) {
      if ((OCCUPYING_STATUSES as readonly string[]).includes(r.status)) booked += r.participantCount;
      else if (r.status === "waitlisted") waitlisted += r.participantCount;
    }
    return {
      id: s.id,
      programId: s.program.id,
      programTitle: s.program.title,
      programType: s.program.type,
      programSlug: s.program.slug,
      startAt: s.startAt.toISOString(),
      endAt: s.endAt.toISOString(),
      status: s.status,
      capacity: s.capacity,
      booked,
      waitlisted,
      instructorId: s.instructor?.id ?? null,
      instructorName: s.instructor?.name ?? null,
      locationName: s.locationName,
      price: Number(s.priceOverride ?? s.program.basePrice),
      currency: s.program.currency,
      notes: s.notes,
    };
  });

  // Doluluk hesaplanan bir değer olduğu için veritabanında filtrelenemez.
  if (filters.occupancy) {
    return events.filter((e) => {
      if (filters.occupancy === "empty") return e.booked === 0;
      if (filters.occupancy === "full") return e.booked >= e.capacity;
      if (filters.occupancy === "partial") return e.booked > 0 && e.booked < e.capacity;
      return true;
    });
  }

  return events;
}

export interface CalendarStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  waitlistedReservations: number;
  /** Yaklaşan oturumların ortalama doluluk oranı (%) */
  occupancyRate: number;
  nextEvent: { title: string; startAt: string; booked: number; capacity: number } | null;
}

/** Takvim ekranının üst kartları. */
export async function getCalendarStats(now = new Date()): Promise<CalendarStats> {
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay); endOfDay.setDate(endOfDay.getDate() + 1);

  // Hafta pazartesi başlar (TR).
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
  const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(endOfWeek.getDate() + 7);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [today, thisWeek, thisMonth, resGroups, upcoming, next] = await Promise.all([
    db.workshopSession.count({ where: { startAt: { gte: startOfDay, lt: endOfDay } } }),
    db.workshopSession.count({ where: { startAt: { gte: startOfWeek, lt: endOfWeek } } }),
    db.workshopSession.count({ where: { startAt: { gte: startOfMonth, lt: endOfMonth } } }),
    db.reservation.groupBy({ by: ["status"], _sum: { participantCount: true }, _count: { _all: true } }),
    db.workshopSession.findMany({
      where: { startAt: { gte: now }, status: { in: ["published", "full"] } },
      select: {
        capacity: true,
        reservations: { select: { status: true, participantCount: true } },
      },
    }),
    db.workshopSession.findFirst({
      where: { startAt: { gte: now }, status: { in: ["published", "full"] } },
      orderBy: { startAt: "asc" },
      select: {
        startAt: true,
        capacity: true,
        program: { select: { title: true } },
        reservations: { select: { status: true, participantCount: true } },
      },
    }),
  ]);

  const byStatus = (s: string) => resGroups.find((g) => g.status === s)?._count._all ?? 0;

  let capacitySum = 0;
  let bookedSum = 0;
  for (const s of upcoming) {
    capacitySum += s.capacity;
    for (const r of s.reservations) {
      if ((OCCUPYING_STATUSES as readonly string[]).includes(r.status)) bookedSum += r.participantCount;
    }
  }

  return {
    today,
    thisWeek,
    thisMonth,
    totalReservations: resGroups.reduce((a, g) => a + g._count._all, 0),
    pendingReservations: byStatus("pending"),
    confirmedReservations: byStatus("confirmed"),
    waitlistedReservations: byStatus("waitlisted"),
    occupancyRate: capacitySum > 0 ? Math.round((bookedSum / capacitySum) * 100) : 0,
    nextEvent: next
      ? {
          title: next.program.title,
          startAt: next.startAt.toISOString(),
          booked: next.reservations
            .filter((r) => (OCCUPYING_STATUSES as readonly string[]).includes(r.status))
            .reduce((a, r) => a + r.participantCount, 0),
          capacity: next.capacity,
        }
      : null,
  };
}

/** Filtre açılırlarını beslemek için — takvimde gerçekten kullanılan değerler. */
export async function getCalendarFilterOptions() {
  const [categories, instructors, locations] = await Promise.all([
    db.programCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true },
    }),
    db.user.findMany({
      where: { role: { in: ["instructor", "admin", "editor"] }, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.workshopSession.findMany({
      where: { locationName: { not: null } },
      distinct: ["locationName"],
      select: { locationName: true },
      orderBy: { locationName: "asc" },
    }),
  ]);

  return {
    categories,
    instructors,
    locations: locations.map((l) => l.locationName).filter((l): l is string => !!l),
  };
}
