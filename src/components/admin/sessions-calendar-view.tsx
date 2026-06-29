"use client";

import { useState } from "react";
import Link from "next/link";

interface Session {
  id: string;
  startAt: string;
  endAt: string;
  capacity: number;
  booked: number;
  status: string;
  locationName: string | null;
  program: { id: string; title: string; type: string };
}

const STATUS_COLORS: Record<string, string> = {
  published: "bg-green-100 text-green-800 border-green-200",
  full: "bg-amber-100 text-amber-800 border-amber-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  completed: "bg-stone-100 text-stone-600 border-stone-200",
  draft: "bg-stone-50 text-stone-500 border-stone-200",
};

const TR_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const TR_MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

export function SessionsCalendarView({ sessions }: { sessions: Session[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const firstDay = new Date(year, month, 1);
  // Monday-first: (0=Sun → 6, 1=Mon → 0, …)
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Group sessions by day
  const byDay: Record<number, Session[]> = {};
  for (const s of sessions) {
    const d = new Date(s.startAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(s);
    }
  }

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="border border-[var(--border)] bg-[var(--surface)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <h2 className="text-sm font-medium text-[var(--text-primary)]">
          {TR_MONTHS[month]} {year}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="flex h-7 w-7 items-center justify-center border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]">‹</button>
          <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }} className="px-3 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">Bugün</button>
          <button onClick={nextMonth} className="flex h-7 w-7 items-center justify-center border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]">›</button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-[var(--border)]">
        {TR_DAYS.map((d) => (
          <div key={d} className="py-2 text-center text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const daySessions = day ? (byDay[day] ?? []) : [];
          return (
            <div
              key={i}
              className={`min-h-[100px] border-b border-r border-[var(--border)] p-1.5 ${
                !day ? "bg-[var(--bg-subtle)]" : ""
              } ${i % 7 === 6 ? "border-r-0" : ""}`}
            >
              {day && (
                <>
                  <span className={`mb-1 flex h-6 w-6 items-center justify-center text-xs ${
                    isToday(day)
                      ? "rounded-full bg-[var(--text-primary)] font-medium text-[var(--surface)]"
                      : "text-[var(--text-muted)]"
                  }`}>
                    {day}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {daySessions.map((s) => (
                      <Link
                        key={s.id}
                        href={`/admin/programlar/${s.program.id}`}
                        className={`block truncate rounded border px-1 py-0.5 text-[10px] leading-tight transition-opacity hover:opacity-80 ${STATUS_COLORS[s.status] ?? "bg-stone-100 border-stone-200 text-stone-600"}`}
                        title={`${s.program.title} — ${s.booked}/${s.capacity} kişi`}
                      >
                        {new Date(s.startAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} {s.program.title}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 border-t border-[var(--border)] px-5 py-3">
        {[["published", "Yayında"], ["full", "Dolu"], ["cancelled", "İptal"], ["completed", "Tamamlandı"]].map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`inline-block h-2.5 w-2.5 rounded-sm border ${STATUS_COLORS[key]}`} />
            <span className="text-[10px] text-[var(--text-muted)]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
