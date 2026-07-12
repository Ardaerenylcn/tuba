"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export interface CalendarSession {
  id: string;
  title: string;
  programType: string;
  startAt: string; // ISO
  endAt: string; // ISO
  price: number;
  currency: string;
  capacity: number;
  reserved: number;
  instructor: string | null;
  locationName: string | null;
}

export interface CalendarType {
  slug: string;
  name: string;
}

// ── Tip renkleri (tailwind statik sınıflar — purge güvenli) ───────────────────
const TYPE_COLORS = [
  { dot: "bg-emerald-500", pill: "border-emerald-200 bg-emerald-50 text-emerald-900", solid: "bg-emerald-500" },
  { dot: "bg-amber-500", pill: "border-amber-200 bg-amber-50 text-amber-900", solid: "bg-amber-500" },
  { dot: "bg-violet-500", pill: "border-violet-200 bg-violet-50 text-violet-900", solid: "bg-violet-500" },
  { dot: "bg-sky-500", pill: "border-sky-200 bg-sky-50 text-sky-900", solid: "bg-sky-500" },
  { dot: "bg-rose-500", pill: "border-rose-200 bg-rose-50 text-rose-900", solid: "bg-rose-500" },
  { dot: "bg-teal-500", pill: "border-teal-200 bg-teal-50 text-teal-900", solid: "bg-teal-500" },
];

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const TZ = "Europe/Istanbul";

// Bir ISO tarihini Istanbul saatine göre "YYYY-MM-DD" anahtarına çevir
function istKey(iso: string): string {
  // en-CA → YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date(iso));
}

function fmtTime(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: TZ, hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

function fmtLongDate(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

// Ay ızgarası: Pazartesi başlangıçlı 6 hafta
function buildMonth(year: number, month: number) {
  const firstWeekday = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7; // Pzt=0
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const daysInPrev = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: { key: string; day: number; inMonth: boolean }[] = [];
  // Önceki ayın kuyruğu
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const day = daysInPrev - i;
    const pm = month === 0 ? 11 : month - 1;
    const py = month === 0 ? year - 1 : year;
    cells.push({ key: `${py}-${pad(pm + 1)}-${pad(day)}`, day, inMonth: false });
  }
  // Bu ay
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ key: `${year}-${pad(month + 1)}-${pad(day)}`, day, inMonth: true });
  }
  // Sonraki ayın başı (42 hücreye tamamla)
  let nd = 1;
  while (cells.length < 42) {
    const nm = month === 11 ? 0 : month + 1;
    const ny = month === 11 ? year + 1 : year;
    cells.push({ key: `${ny}-${pad(nm + 1)}-${pad(nd)}`, day: nd, inMonth: false });
    nd++;
  }
  return cells;
}

export function CalendarView({ sessions, types }: { sessions: CalendarSession[]; types: CalendarType[] }) {
  const todayKey = istKey(new Date().toISOString());

  // Tip → renk ve ad haritaları
  const colorByType = useMemo(() => {
    const m = new Map<string, (typeof TYPE_COLORS)[number]>();
    types.forEach((t, i) => m.set(t.slug, TYPE_COLORS[i % TYPE_COLORS.length]));
    return m;
  }, [types]);
  const nameByType = useMemo(() => new Map(types.map((t) => [t.slug, t.name])), [types]);

  const [activeType, setActiveType] = useState<string>("all");

  const visibleSessions = useMemo(
    () => (activeType === "all" ? sessions : sessions.filter((s) => s.programType === activeType)),
    [sessions, activeType],
  );

  // Güne göre grupla (Istanbul)
  const byDay = useMemo(() => {
    const m = new Map<string, CalendarSession[]>();
    for (const s of visibleSessions) {
      const k = istKey(s.startAt);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(s);
    }
    for (const arr of m.values()) arr.sort((a, b) => a.startAt.localeCompare(b.startAt));
    return m;
  }, [visibleSessions]);

  // İlk oturumun ayı ve günü (başlangıç görünümü)
  const firstKey = sessions.length ? istKey(sessions[0].startAt) : todayKey;
  const [fy, fm] = firstKey.split("-").map(Number);

  const [view, setView] = useState({ year: fy, month: fm - 1 }); // month 0-based
  const [selected, setSelected] = useState<string>(firstKey);

  const cells = useMemo(() => buildMonth(view.year, view.month), [view]);

  const monthLabel = new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", month: "long", year: "numeric" })
    .format(new Date(Date.UTC(view.year, view.month, 1)));

  function shiftMonth(delta: number) {
    setView((v) => {
      let m = v.month + delta;
      let y = v.year;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      return { year: y, month: m };
    });
  }

  function goToFirst() {
    setView({ year: fy, month: fm - 1 });
    setSelected(firstKey);
  }

  const selectedSessions = byDay.get(selected) ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Tip filtreleri */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip active={activeType === "all"} onClick={() => setActiveType("all")} label="Tümü" dot={null} />
        {types.map((t) => (
          <FilterChip
            key={t.slug}
            active={activeType === t.slug}
            onClick={() => setActiveType(t.slug)}
            label={t.name}
            dot={colorByType.get(t.slug)?.dot ?? "bg-stone-400"}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Takvim */}
        <div className="border border-[var(--border)] bg-[var(--surface)]">
          {/* Ay başlığı + navigasyon */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <h2 className="text-base font-medium capitalize text-[var(--text-primary)]">{monthLabel}</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={goToFirst}
                className="mr-1 h-8 px-3 text-[11px] font-medium tracking-wide text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="İlk programa git"
              >
                Bugün
              </button>
              <button
                onClick={() => shiftMonth(-1)}
                aria-label="Önceki ay"
                className="flex h-8 w-8 items-center justify-center border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
              >
                ‹
              </button>
              <button
                onClick={() => shiftMonth(1)}
                aria-label="Sonraki ay"
                className="flex h-8 w-8 items-center justify-center border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
              >
                ›
              </button>
            </div>
          </div>

          {/* Hafta günleri */}
          <div className="grid grid-cols-7 border-b border-[var(--border)]">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-2 text-center text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">
                {w}
              </div>
            ))}
          </div>

          {/* Günler */}
          <div className="grid grid-cols-7">
            {cells.map((cell, i) => {
              const daySessions = cell.inMonth ? byDay.get(cell.key) ?? [] : [];
              const isSelected = cell.key === selected;
              const isToday = cell.key === todayKey;
              const isPast = cell.key < todayKey;
              return (
                <button
                  key={cell.key + i}
                  onClick={() => cell.inMonth && setSelected(cell.key)}
                  disabled={!cell.inMonth}
                  className={`relative flex min-h-[76px] flex-col gap-1 border-b border-r border-[var(--border)] p-1.5 text-left transition-colors sm:min-h-[92px] ${
                    !cell.inMonth
                      ? "bg-[var(--bg-subtle)]/40 cursor-default"
                      : isSelected
                        ? "bg-[var(--bg-subtle)] ring-1 ring-inset ring-[var(--text-primary)]"
                        : "hover:bg-[var(--bg-subtle)]"
                  } ${(i + 1) % 7 === 0 ? "border-r-0" : ""}`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      isToday
                        ? "bg-[var(--text-primary)] font-semibold text-[var(--surface)]"
                        : cell.inMonth
                          ? isPast ? "text-[var(--text-disabled)]" : "text-[var(--text-secondary)]"
                          : "text-[var(--text-disabled)]"
                    }`}
                  >
                    {cell.day}
                  </span>

                  {/* Oturum pilleri */}
                  <div className="flex flex-col gap-0.5">
                    {daySessions.slice(0, 2).map((s) => {
                      const c = colorByType.get(s.programType);
                      return (
                        <span
                          key={s.id}
                          className={`hidden truncate rounded-sm border px-1 py-0.5 text-[9px] leading-tight sm:block ${c?.pill ?? "border-stone-200 bg-stone-50 text-stone-800"}`}
                        >
                          {fmtTime(s.startAt)} {s.title}
                        </span>
                      );
                    })}
                    {/* Mobilde noktalar */}
                    <div className="flex flex-wrap gap-0.5 sm:hidden">
                      {daySessions.slice(0, 4).map((s) => (
                        <span key={s.id} className={`h-1.5 w-1.5 rounded-full ${colorByType.get(s.programType)?.dot ?? "bg-stone-400"}`} />
                      ))}
                    </div>
                    {daySessions.length > 2 && (
                      <span className="hidden text-[9px] text-[var(--text-muted)] sm:block">
                        +{daySessions.length - 2} daha
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Seçili gün detayı */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Seçili Gün</p>
              <p className="mt-1 text-sm font-medium capitalize text-[var(--text-primary)]">{fmtLongDate(selected)}</p>
            </div>

            {selectedSessions.length === 0 ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 px-5 py-10 text-center">
                <p className="text-sm text-[var(--text-muted)]">Bu gün için program yok.</p>
                <p className="text-xs text-[var(--text-disabled)]">Takvimde renkli günlere tıklayın.</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[var(--border)]">
                {selectedSessions.map((s) => {
                  const c = colorByType.get(s.programType);
                  const spots = s.capacity - s.reserved;
                  const full = spots <= 0;
                  return (
                    <div key={s.id} className="flex flex-col gap-2 p-5">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${c?.dot ?? "bg-stone-400"}`} />
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                          {nameByType.get(s.programType) ?? s.programType}
                        </span>
                      </div>
                      <p className="text-sm font-medium leading-snug text-[var(--text-primary)]">{s.title}</p>

                      <div className="flex flex-col gap-1 text-xs text-[var(--text-secondary)]">
                        <span>🕐 {fmtTime(s.startAt)} – {fmtTime(s.endAt)}</span>
                        {s.instructor && <span>👤 {s.instructor}</span>}
                        {s.locationName && <span>📍 {s.locationName}</span>}
                        <span className={full ? "text-red-600" : ""}>
                          {full ? "Kontenjan dolu" : `${spots} kişilik yer kaldı`}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-base font-medium text-[var(--text-primary)]">
                          {s.price.toLocaleString("tr-TR")} ₺
                        </span>
                        {full ? (
                          <span className="cursor-not-allowed bg-[var(--bg-subtle)] px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-[var(--text-disabled)]">
                            Dolu
                          </span>
                        ) : (
                          <Link
                            href={`/rezervasyon?session=${s.id}`}
                            className="bg-[var(--text-primary)] px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)]"
                          >
                            Kayıt Ol →
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function FilterChip({
  active, onClick, label, dot,
}: {
  active: boolean; onClick: () => void; label: string; dot: string | null;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs transition-colors ${
        active
          ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--surface)]"
          : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
      }`}
    >
      {dot && <span className={`h-2 w-2 rounded-full ${active ? "bg-[var(--surface)]" : dot}`} />}
      {label}
    </button>
  );
}
