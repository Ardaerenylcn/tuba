"use client";

import { useState } from "react";
import Link from "next/link";

interface Session {
  id: string;
  startAt: Date | string;
  endAt: Date | string;
  capacity: number;
  availableSpots: number;
  locationName: string | null;
  priceOverride: unknown;
  instructor: { id: string; name: string } | null;
}

interface Props {
  sessions: Session[];
  basePrice: number;
  currency: string;
}

const MONTH_NAMES = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const DAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function toDateStr(date: Date | string): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Istanbul" }).format(new Date(date));
}

function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul",
  }).format(new Date(date));
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function SessionCalendar({ sessions, basePrice, currency }: Props) {
  const today = new Date();
  const todayStr = toDateStr(today);

  const [viewYear, setViewYear] = useState(() => {
    // Start at the month of the first upcoming session (or current month)
    const first = sessions.find((s) => toDateStr(s.startAt) >= todayStr);
    if (first) {
      const d = new Date(first.startAt);
      return d.getUTCFullYear();
    }
    return today.getFullYear();
  });

  const [viewMonth, setViewMonth] = useState(() => {
    const first = sessions.find((s) => toDateStr(s.startAt) >= todayStr);
    if (first) {
      const istStr = toDateStr(first.startAt); // "YYYY-MM-DD"
      return Number(istStr.slice(5, 7)) - 1;
    }
    return today.getMonth();
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Group sessions by Istanbul date string
  const byDate = new Map<string, Session[]>();
  for (const s of sessions) {
    const ds = toDateStr(s.startAt);
    if (!byDate.has(ds)) byDate.set(ds, []);
    byDate.get(ds)!.push(s);
  }

  // Build calendar grid (Mon-start)
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startDow = (firstOfMonth.getDay() + 6) % 7; // Mon=0 … Sun=6

  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
    setSelectedDate(null);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
    setSelectedDate(null);
  }

  const thisMonthStr = `${viewYear}-${pad2(viewMonth + 1)}`;
  const todayMonthStr = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}`;
  const canGoPrev = thisMonthStr > todayMonthStr;

  // Check if this month has any sessions (for "no sessions" message)
  const monthHasSessions = sessions.some((s) => toDateStr(s.startAt).startsWith(thisMonthStr));

  const selectedSessions = selectedDate ? (byDate.get(selectedDate) ?? []) : [];

  return (
    <div className="flex flex-col gap-5">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="flex h-8 w-8 items-center justify-center text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-25 disabled:cursor-not-allowed"
          aria-label="Önceki ay"
        >
          ←
        </button>
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          aria-label="Sonraki ay"
        >
          →
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-1 text-center text-[10px] font-medium tracking-[0.08em] uppercase text-[var(--text-disabled)]">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1 -mt-3">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;

          const dateStr = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}`;
          const daySessions = byDate.get(dateStr) ?? [];
          const hasSession = daySessions.length > 0;
          const isPast = dateStr < todayStr;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const isFull = hasSession && daySessions.every((s) => s.availableSpots <= 0);
          const isLow = hasSession && !isFull && daySessions.some((s) => s.availableSpots > 0 && s.availableSpots <= 2);

          if (isPast) {
            return (
              <div key={dateStr} className="flex flex-col items-center py-1">
                <span className="flex h-8 w-8 items-center justify-center text-sm text-[var(--text-disabled)]">
                  {day}
                </span>
              </div>
            );
          }

          if (!hasSession) {
            return (
              <div key={dateStr} className="flex flex-col items-center py-1">
                <span className={`flex h-8 w-8 items-center justify-center text-sm ${
                  isToday ? "border border-[var(--border-strong)] font-medium text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                }`}>
                  {day}
                </span>
              </div>
            );
          }

          return (
            <div key={dateStr} className="flex flex-col items-center py-1">
              <button
                type="button"
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`flex h-8 w-8 items-center justify-center text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-[var(--text-primary)] text-[var(--surface)]"
                    : isFull
                    ? "border border-[var(--border)] text-[var(--text-disabled)] cursor-not-allowed"
                    : "bg-[var(--text-primary)] text-[var(--surface)] opacity-80 hover:opacity-100"
                }`}
                disabled={isFull}
                aria-label={`${day} ${MONTH_NAMES[viewMonth]}`}
                aria-pressed={isSelected}
              >
                {day}
              </button>
              {/* Dot indicator */}
              <span className={`mt-0.5 h-1 w-1 rounded-full ${
                isFull ? "bg-[var(--text-disabled)]" :
                isLow ? "bg-amber-500" :
                "bg-[var(--text-primary)] opacity-40"
              }`} />
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="inline-flex h-4 w-4 items-center justify-center bg-[var(--text-primary)] text-[6px] text-[var(--surface)]">■</span>
          Müsait
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
          Son yer
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--border-strong)]" />
          Dolu
        </span>
      </div>

      {/* No sessions this month */}
      {!monthHasSessions && (
        <p className="text-center text-xs text-[var(--text-muted)]">
          Bu ayda müsait oturum bulunmuyor.
        </p>
      )}

      {/* Selected date panel */}
      {selectedDate && selectedSessions.length > 0 && (
        <div className="border border-[var(--border)] p-4 flex flex-col gap-3">
          <p className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
            {new Intl.DateTimeFormat("tr-TR", {
              day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul",
            }).format(new Date(selectedDate + "T12:00:00"))}
          </p>

          {selectedSessions.map((s) => {
            const price = Number(s.priceOverride ?? basePrice);
            const isFull = s.availableSpots <= 0;
            const isLow = s.availableSpots > 0 && s.availableSpots <= 2;

            return (
              <div key={s.id} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">
                      {formatTime(s.startAt)} – {formatTime(s.endAt)}
                    </span>
                    {isLow && (
                      <span className="text-[10px] font-medium text-amber-600">
                        Son {s.availableSpots} yer
                      </span>
                    )}
                    {isFull && (
                      <span className="text-[10px] text-[var(--text-disabled)]">Dolu</span>
                    )}
                  </div>
                  {s.locationName && (
                    <span className="text-xs text-[var(--text-muted)]">{s.locationName}</span>
                  )}
                  {s.instructor && (
                    <span className="text-xs text-[var(--text-muted)]">
                      Eğitmen: {s.instructor.name}
                    </span>
                  )}
                  <div className="flex items-baseline justify-between border-t border-[var(--border)] pt-2">
                    <span className="text-xs text-[var(--text-muted)]">Kişi başı</span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {price.toLocaleString("tr-TR")} {currency === "TRY" ? "₺" : currency}
                    </span>
                  </div>
                </div>

                {isFull ? (
                  <p className="text-center text-xs text-[var(--text-disabled)]">Kontenjan doldu</p>
                ) : (
                  <Link
                    href={`/rezervasyon?session=${s.id}`}
                    className="block w-full bg-[var(--text-primary)] py-3 text-center text-xs font-medium tracking-[0.15em] uppercase text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)]"
                  >
                    Rezervasyon Yap
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
