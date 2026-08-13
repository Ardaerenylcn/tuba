"use client";

import type { CalendarEvent } from "@/lib/calendar";
import { CalendarEventCard } from "./calendar-event-card";

const TR_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Etkinlikleri gün anahtarına göre grupla — üç görünüm de bunu kullanır. */
function groupByDay(events: CalendarEvent[]) {
  const map = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const k = dayKey(new Date(e.startAt));
    const list = map.get(k);
    if (list) list.push(e);
    else map.set(k, [e]);
  }
  return map;
}

interface ViewProps {
  events: CalendarEvent[];
  cursor: Date;
  onOpen: (id: string) => void;
  onDropOnDay?: (eventId: string, day: Date) => void;
}

/** Pazartesi başlangıçlı aylık ızgara. */
export function MonthView({ events, cursor, onOpen, onDropOnDay }: ViewProps) {
  const byDay = groupByDay(events);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const isToday = (d: Date) => dayKey(d) === dayKey(today);

  return (
    <div className="border border-[var(--border)] bg-[var(--surface)]">
      <div className="grid grid-cols-7 border-b border-[var(--border)]">
        {TR_DAYS.map((d) => (
          <div key={d} className="px-2 py-2 text-center text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--text-muted)]">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          const list = d ? (byDay.get(dayKey(d)) ?? []) : [];
          return (
            <div
              key={i}
              onDragOver={d && onDropOnDay ? (e) => e.preventDefault() : undefined}
              onDrop={
                d && onDropOnDay
                  ? (e) => {
                      e.preventDefault();
                      const id = e.dataTransfer.getData("text/plain");
                      if (id) onDropOnDay(id, d);
                    }
                  : undefined
              }
              className={`min-h-[92px] border-b border-r border-[var(--border)] p-1.5 ${
                !d ? "bg-[var(--bg-subtle)]" : ""
              } ${i % 7 === 6 ? "border-r-0" : ""}`}
            >
              {d && (
                <>
                  <span
                    className={`mb-1 inline-flex h-5 w-5 items-center justify-center text-[11px] tabular-nums ${
                      isToday(d)
                        ? "rounded-full bg-[var(--text-primary)] text-[var(--surface)]"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {d.getDate()}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {list.slice(0, 3).map((e) => (
                      <CalendarEventCard
                        key={e.id}
                        event={e}
                        onOpen={onOpen}
                        draggable={!!onDropOnDay}
                      />
                    ))}
                    {list.length > 3 && (
                      <span className="px-1 text-[10px] text-[var(--text-muted)]">
                        +{list.length - 3} daha
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Haftalık görünüm — 7 sütun, her sütunda o günün etkinlikleri saat sırasıyla. */
export function WeekView({ events, cursor, onOpen, onDropOnDay }: ViewProps) {
  const byDay = groupByDay(events);
  const start = new Date(cursor);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  const today = new Date();

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
      {days.map((d) => {
        const list = byDay.get(dayKey(d)) ?? [];
        const isToday = dayKey(d) === dayKey(today);
        return (
          <div
            key={d.toISOString()}
            onDragOver={onDropOnDay ? (e) => e.preventDefault() : undefined}
            onDrop={
              onDropOnDay
                ? (e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/plain");
                    if (id) onDropOnDay(id, d);
                  }
                : undefined
            }
            className={`min-h-[120px] border border-[var(--border)] bg-[var(--surface)] p-2 ${
              isToday ? "ring-1 ring-inset ring-[var(--text-primary)]/20" : ""
            }`}
          >
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--text-muted)]">
              {TR_DAYS[(d.getDay() + 6) % 7]}{" "}
              <span className="tabular-nums">{d.getDate()}</span>
            </p>
            <div className="flex flex-col gap-1">
              {list.length === 0 ? (
                <span className="text-[10px] text-[var(--text-disabled)]">—</span>
              ) : (
                list.map((e) => (
                  <CalendarEventCard
                    key={e.id}
                    event={e}
                    variant="detailed"
                    onOpen={onOpen}
                    draggable={!!onDropOnDay}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Günlük görünüm — tek günün etkinlikleri, ayrıntılı. */
export function DayView({ events, cursor, onOpen }: ViewProps) {
  const list = (groupByDay(events).get(dayKey(cursor)) ?? []).slice();
  return (
    <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="mb-3 text-sm font-medium text-[var(--text-primary)]">
        {cursor.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </p>
      {list.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--text-muted)]">Bu günde oturum yok.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((e) => (
            <CalendarEventCard key={e.id} event={e} variant="detailed" onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Liste görünümü — güne göre gruplu, mobilde varsayılan. */
export function ListView({ events, onOpen }: ViewProps) {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] py-16">
        <p className="text-sm text-[var(--text-muted)]">Bu aralıkta oturum yok.</p>
      </div>
    );
  }
  const byDay = groupByDay(events);
  return (
    <div className="flex flex-col gap-4">
      {[...byDay.entries()].map(([key, list]) => {
        const d = new Date(list[0].startAt);
        return (
          <div key={key}>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-muted)]">
              {d.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <div className="flex flex-col gap-1 border border-[var(--border)] bg-[var(--surface)] p-2">
              {list.map((e) => (
                <CalendarEventCard key={e.id} event={e} variant="detailed" onOpen={onOpen} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
