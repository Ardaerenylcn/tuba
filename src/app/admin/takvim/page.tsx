import Link from "next/link";
import { db } from "@/lib/db";
import { getCalendarEvents, getCalendarFilterOptions, getCalendarStats, type CalendarViewMode } from "@/lib/calendar";
import { CalendarStatsRow } from "@/components/admin/calendar/calendar-stats";
import { CalendarClient, type CalendarQuery } from "@/components/admin/calendar/calendar-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Takvim | Admin" };
export const dynamic = "force-dynamic";

const VALID_VIEWS = ["month", "week", "day", "list"] as const;

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

/**
 * Görünüme göre çekilecek tarih aralığı.
 *
 * Liste görünümü tek ay yerine geniş bir pencere gösterir; "gelecek/geçmiş"
 * hızlı filtreleri işe yarasın diye 3 ay geriden 12 ay ileriye bakar.
 */
function rangeFor(view: CalendarViewMode, cursor: Date): { from: Date; to: Date } {
  if (view === "day") {
    const from = new Date(cursor); from.setHours(0, 0, 0, 0);
    const to = new Date(from); to.setDate(to.getDate() + 1);
    return { from, to };
  }
  if (view === "week") {
    const from = new Date(cursor); from.setHours(0, 0, 0, 0);
    from.setDate(from.getDate() - ((from.getDay() + 6) % 7));
    const to = new Date(from); to.setDate(to.getDate() + 7);
    return { from, to };
  }
  if (view === "list") {
    const from = new Date(cursor.getFullYear(), cursor.getMonth() - 3, 1);
    const to = new Date(cursor.getFullYear(), cursor.getMonth() + 12, 1);
    return { from, to };
  }
  // Ay görünümü: ızgaranın taşan günleri de görünsün diye bir hafta pay bırakılır.
  const from = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  from.setDate(from.getDate() - 7);
  const to = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  to.setDate(to.getDate() + 7);
  return { from, to };
}

export default async function AdminCalendarPage({ searchParams }: Props) {
  const sp = await searchParams;

  const view: CalendarViewMode = (VALID_VIEWS as readonly string[]).includes(sp.view ?? "")
    ? (sp.view as CalendarViewMode)
    : "month";

  const parsed = sp.date ? new Date(sp.date) : new Date();
  const cursor = Number.isNaN(parsed.getTime()) ? new Date() : parsed;

  const filters = {
    type: sp.type,
    instructorId: sp.instructorId,
    location: sp.location,
    status: sp.status,
    occupancy: sp.occupancy,
    search: sp.search,
  };

  const { from, to } = rangeFor(view, cursor);

  const [events, stats, options, programRows] = await Promise.all([
    getCalendarEvents(from, to, filters),
    getCalendarStats(),
    getCalendarFilterOptions(),
    // Form program seçtirir; ad/açıklama/görsel programa aittir, takvim kopyalamaz.
    db.program.findMany({
      where: { status: { not: "archived" } },
      orderBy: [{ type: "asc" }, { title: "asc" }],
      select: { id: true, title: true, type: true, defaultCapacity: true, durationMinutes: true, basePrice: true },
    }),
  ]);

  const programs = programRows.map((p) => ({ ...p, basePrice: Number(p.basePrice) }));

  const query: CalendarQuery = {
    view,
    date: cursor.toISOString().slice(0, 10),
    ...filters,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium text-[var(--text-primary)]">Takvim</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Oturumlar ve rezervasyonlar — sitedeki takvimle aynı veri
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/programlar"
            className="inline-flex h-9 items-center border border-[var(--border)] px-3 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
          >
            Programlar
          </Link>
          <Link
            href="/admin/rezervasyonlar"
            className="inline-flex h-9 items-center border border-[var(--border)] px-3 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
          >
            Rezervasyonlar
          </Link>
        </div>
      </div>

      <CalendarStatsRow stats={stats} />

      <CalendarClient events={events} query={query} options={options} programs={programs} />
    </div>
  );
}
