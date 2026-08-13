import type { CalendarStats } from "@/lib/calendar";

function Card({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1.5 text-xl font-light tabular-nums text-[var(--text-primary)]">{value}</p>
      {hint && <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}

/** Takvim ekranının üst özet kartları. */
export function CalendarStatsRow({ stats }: { stats: CalendarStats }) {
  const next = stats.nextEvent;
  const nextHint = next
    ? `${new Date(next.startAt).toLocaleString("tr-TR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })} · ${next.booked}/${next.capacity}`
    : undefined;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Card label="Bugün" value={String(stats.today)} hint="oturum" />
      <Card label="Bu hafta" value={String(stats.thisWeek)} hint="oturum" />
      <Card label="Bu ay" value={String(stats.thisMonth)} hint="oturum" />
      <Card
        label="Rezervasyon"
        value={String(stats.totalReservations)}
        hint={`${stats.pendingReservations} bekliyor · ${stats.confirmedReservations} onaylı`}
      />
      <Card label="Doluluk" value={`%${stats.occupancyRate}`} hint="yaklaşan oturumlar" />
      <Card label="En yakın" value={next ? next.title : "—"} hint={nextHint} />
    </div>
  );
}
