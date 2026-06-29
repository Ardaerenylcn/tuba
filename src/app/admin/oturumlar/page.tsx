import Link from "next/link";
import { db } from "@/lib/db";
import { SessionsCalendarView } from "@/components/admin/sessions-calendar-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Oturumlar | Admin" };

const STATUS_LABELS: Record<string, string> = {
  draft: "Taslak",
  published: "Yayında",
  full: "Dolu",
  cancelled: "İptal",
  completed: "Tamamlandı",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-stone-100 text-stone-600",
  published: "bg-green-50 text-green-700",
  full: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-600",
  completed: "bg-stone-100 text-stone-500",
};

const FILTER_TABS = [
  { key: "upcoming", label: "Yaklaşan" },
  { key: "past", label: "Geçmiş" },
  { key: "all", label: "Tümü" },
  { key: "calendar", label: "Takvim" },
];

interface Props {
  searchParams: Promise<{ filter?: string }>;
}

export default async function AdminSessionsPage({ searchParams }: Props) {
  const { filter = "upcoming" } = await searchParams;
  const now = new Date();

  const where =
    filter === "upcoming"
      ? { startAt: { gte: now } }
      : filter === "past"
      ? { startAt: { lt: now } }
      : filter === "calendar"
      ? {}
      : {};

  const sessions = await db.workshopSession.findMany({
    where,
    orderBy: { startAt: filter === "past" ? "desc" : "asc" },
    include: {
      program: { select: { id: true, title: true, type: true } },
      instructor: { select: { name: true } },
      _count: {
        select: {
          reservations: { where: { status: { in: ["pending", "confirmed"] } } },
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-medium text-[var(--text-primary)]">Oturumlar</h1>
        <p className="text-sm text-[var(--text-muted)]">{sessions.length} oturum</p>
      </div>

      <div className="flex items-center gap-1 border-b border-[var(--border)]">
        {FILTER_TABS.map((tab) => {
          const active = tab.key === filter;
          return (
            <Link
              key={tab.key}
              href={`/admin/oturumlar?filter=${tab.key}`}
              className={`border-b-2 px-3 pb-3 pt-1 text-xs font-medium transition-colors ${
                active
                  ? "border-[var(--text-primary)] text-[var(--text-primary)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {filter === "calendar" ? (
        <SessionsCalendarView
          sessions={sessions.map((s) => ({
            id: s.id,
            startAt: s.startAt.toISOString(),
            endAt: s.endAt.toISOString(),
            capacity: s.capacity,
            booked: s._count.reservations,
            status: s.status,
            locationName: s.locationName ?? null,
            program: s.program,
          }))}
        />
      ) : null}

      <div className={`border border-[var(--border)] bg-[var(--surface)] ${filter === "calendar" ? "hidden" : ""}`}>
        {sessions.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-[var(--text-muted)]">Bu filtrede oturum yok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {["Program", "Tarih / Saat", "Eğitmen", "Doluluk", "Konum", "Durum", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {sessions.map((s) => {
                  const booked = s._count.reservations;
                  const pct = Math.round((booked / s.capacity) * 100);
                  return (
                    <tr key={s.id} className="hover:bg-[var(--bg-subtle)]">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--text-primary)]">{s.program.title}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {s.program.type === "workshop" ? "Atölye" : "Sertifika"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">
                        <p>
                          {new Intl.DateTimeFormat("tr-TR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            timeZone: "Europe/Istanbul",
                          }).format(new Date(s.startAt))}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {new Intl.DateTimeFormat("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "Europe/Istanbul",
                          }).format(new Date(s.startAt))}
                          {" – "}
                          {new Intl.DateTimeFormat("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "Europe/Istanbul",
                          }).format(new Date(s.endAt))}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">
                        {s.instructor?.name ?? <span className="text-[var(--text-disabled)]">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[var(--text-primary)]">
                          {booked} / {s.capacity}
                        </p>
                        <div className="mt-1 h-1 w-20 bg-[var(--bg-subtle)]">
                          <div
                            className={`h-full ${pct >= 100 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-green-500"}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                        {s.locationName ?? <span className="text-[var(--text-disabled)]">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs ${STATUS_COLORS[s.status] ?? ""}`}>
                          {STATUS_LABELS[s.status] ?? s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/programlar/${s.program.id}`}
                          className="text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)]"
                        >
                          Programı Düzenle
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
