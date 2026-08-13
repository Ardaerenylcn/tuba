"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CalendarEvent, CalendarViewMode } from "@/lib/calendar";
import { DayView, ListView, MonthView, WeekView } from "./calendar-views";
import { EventDetailModal } from "./event-detail-modal";
import { EventFormModal, type EventFormInitial, type ProgramOption } from "./event-form-modal";
import { SESSION_STATUS_LABELS } from "./status-labels";

const VIEW_STORAGE_KEY = "admin-calendar-view";

const VIEWS: { key: CalendarViewMode; label: string }[] = [
  { key: "month", label: "Ay" },
  { key: "week", label: "Hafta" },
  { key: "day", label: "Gün" },
  { key: "list", label: "Liste" },
];

const TR_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export interface FilterOptions {
  categories: { slug: string; name: string }[];
  instructors: { id: string; name: string }[];
  locations: string[];
}

export interface CalendarQuery {
  view: CalendarViewMode;
  date: string;
  type?: string;
  instructorId?: string;
  location?: string;
  status?: string;
  occupancy?: string;
  search?: string;
}

/**
 * Takvim ekranının etkileşimli katmanı.
 *
 * Veri sunucuda çekilir; bu bileşen görünüm/tarih/filtreleri URL'e yazar ve
 * sayfayı yeniden çalıştırır. Böylece tek veri kaynağı korunur (kullanıcı
 * tarafındaki takvimle aynı tablolar) ve durum paylaşılabilir/geri alınabilir.
 */
export function CalendarClient({
  events,
  query,
  options,
  programs,
}: {
  events: CalendarEvent[];
  query: CalendarQuery;
  options: FilterOptions;
  programs: ProgramOption[];
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<EventFormInitial | undefined>(undefined);
  const [dragBusy, setDragBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const cursor = new Date(query.date);

  // Görünüm tercihi hatırlanır. URL'de görünüm yoksa kayıtlı tercihe geçilir.
  useEffect(() => {
    const saved = window.localStorage.getItem(VIEW_STORAGE_KEY) as CalendarViewMode | null;
    const url = new URL(window.location.href);
    if (!url.searchParams.get("view") && saved && saved !== query.view) {
      url.searchParams.set("view", saved);
      router.replace(url.pathname + url.search);
    }
  }, [query.view, router]);

  function push(patch: Partial<CalendarQuery>) {
    const url = new URL(window.location.href);
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === "") url.searchParams.delete(k);
      else url.searchParams.set(k, String(v));
    }
    router.push(url.pathname + url.search);
  }

  function setView(view: CalendarViewMode) {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
    push({ view });
  }

  function shift(dir: -1 | 1) {
    const d = new Date(cursor);
    if (query.view === "month") d.setMonth(d.getMonth() + dir);
    else if (query.view === "week") d.setDate(d.getDate() + 7 * dir);
    else if (query.view === "day") d.setDate(d.getDate() + dir);
    else d.setMonth(d.getMonth() + dir);
    push({ date: d.toISOString().slice(0, 10) });
  }

  function quick(range: "today" | "week" | "month" | "upcoming" | "past") {
    const now = new Date();
    if (range === "today") push({ view: "day", date: now.toISOString().slice(0, 10) });
    else if (range === "week") push({ view: "week", date: now.toISOString().slice(0, 10) });
    else if (range === "month") push({ view: "month", date: now.toISOString().slice(0, 10) });
    else if (range === "upcoming") push({ view: "list", date: now.toISOString().slice(0, 10), occupancy: undefined });
    else {
      const d = new Date(now); d.setMonth(d.getMonth() - 1);
      push({ view: "list", date: d.toISOString().slice(0, 10) });
    }
  }

  /** Sürükle-bırak: yalnızca günü değiştirir, saat korunur. */
  async function moveToDay(eventId: string, day: Date) {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return;

    const oldStart = new Date(ev.startAt);
    const oldEnd = new Date(ev.endAt);
    const durationMs = oldEnd.getTime() - oldStart.getTime();
    const newStart = new Date(day);
    newStart.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0);
    if (newStart.getTime() === oldStart.getTime()) return;
    const newEnd = new Date(newStart.getTime() + durationMs);

    const active = ev.booked;
    const warn =
      active > 0
        ? `Bu oturumda ${active} kişilik aktif rezervasyon var. Tarihi ${newStart.toLocaleDateString("tr-TR")} olarak değiştirmek onların randevusunu da değiştirir. Katılımcılara otomatik bildirim gitmez.\n\nDevam edilsin mi?`
        : `Tarih ${newStart.toLocaleDateString("tr-TR")} olarak değiştirilecek. Devam edilsin mi?`;
    if (!window.confirm(warn)) return;

    setDragBusy(true);
    try {
      const res = await fetch(`/api/v1/admin/sessions/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startAt: newStart.toISOString(), endAt: newEnd.toISOString() }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Güncellenemedi.");
      setToast(data.message ?? "Etkinlik tarihi güncellendi.");
      router.refresh();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Hata.");
    } finally {
      setDragBusy(false);
      setTimeout(() => setToast(null), 4000);
    }
  }

  function openNew() {
    setFormInitial(undefined);
    setFormOpen(true);
  }

  /** Detaydan düzenlemeye geçiş — form alanları detay verisinden doldurulur. */
  function openEditFromDetail(d: {
    id: string; startAt: string; endAt: string; capacity: number; status: string;
    locationName: string | null; locationAddress: string | null; notes: string | null;
    priceOverride: number | null; instructor: { id: string } | null; program: { id: string };
  }) {
    const start = new Date(d.startAt);
    const end = new Date(d.endAt);
    const hhmm = (x: Date) => `${String(x.getHours()).padStart(2, "0")}:${String(x.getMinutes()).padStart(2, "0")}`;
    setFormInitial({
      sessionId: d.id,
      programId: d.program.id,
      date: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`,
      startTime: hhmm(start),
      endTime: hhmm(end),
      capacity: d.capacity,
      instructorId: d.instructor?.id ?? "",
      locationName: d.locationName ?? "",
      locationAddress: d.locationAddress ?? "",
      priceOverride: d.priceOverride !== null ? String(d.priceOverride) : "",
      status: d.status,
      notes: d.notes ?? "",
    });
    setOpenId(null);
    setFormOpen(true);
  }

  const hasFilters = !!(query.type || query.instructorId || query.location || query.status || query.occupancy || query.search);

  const title =
    query.view === "day"
      ? cursor.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
      : query.view === "week"
      ? `${cursor.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} haftası`
      : `${TR_MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;

  const viewProps = {
    events,
    cursor,
    onOpen: setOpenId,
    onDropOnDay: query.view === "month" || query.view === "week" ? moveToDay : undefined,
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Araç çubuğu */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => shift(-1)} aria-label="Önceki" className="h-8 w-8 border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]">‹</button>
          <button type="button" onClick={() => shift(1)} aria-label="Sonraki" className="h-8 w-8 border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]">›</button>
          <p className="ml-1 text-sm font-medium text-[var(--text-primary)]">{title}</p>
          <span className="text-xs text-[var(--text-muted)]">({events.length} oturum)</span>
        </div>

        <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openNew}
          className="h-8 bg-[var(--text-primary)] px-3 text-xs font-medium text-[var(--surface)] transition-opacity hover:opacity-90"
        >
          + Yeni Oturum
        </button>
        <div className="flex items-center gap-1 border border-[var(--border)]">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setView(v.key)}
              aria-pressed={query.view === v.key}
              className={`h-8 px-3 text-xs transition-colors ${
                query.view === v.key
                  ? "bg-[var(--text-primary)] text-[var(--surface)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* Hızlı filtreler */}
      <div className="flex flex-wrap items-center gap-1.5">
        {([["today","Bugün"],["week","Bu hafta"],["month","Bu ay"],["upcoming","Gelecek"],["past","Geçmiş"]] as const).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => quick(k)}
            className="h-7 border border-[var(--border)] px-2.5 text-[11px] text-[var(--text-secondary)] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
          >
            {label}
          </button>
        ))}
        {hasFilters && (
          <button
            type="button"
            onClick={() => push({ type: undefined, instructorId: undefined, location: undefined, status: undefined, occupancy: undefined, search: undefined })}
            className="h-7 border border-[var(--border)] px-2.5 text-[11px] text-red-600 transition-colors hover:bg-red-50"
          >
            Filtreleri temizle
          </button>
        )}
      </div>

      {/* Filtreler + arama */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <input
          type="search"
          defaultValue={query.search ?? ""}
          placeholder="Etkinlik, katılımcı, telefon, e-posta…"
          onKeyDown={(e) => { if (e.key === "Enter") push({ search: (e.target as HTMLInputElement).value }); }}
          className="col-span-2 h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] lg:col-span-2"
        />
        <Select value={query.type ?? ""} onChange={(v) => push({ type: v })} placeholder="Tür">
          {options.categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </Select>
        <Select value={query.instructorId ?? ""} onChange={(v) => push({ instructorId: v })} placeholder="Eğitmen">
          {options.instructors.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
        </Select>
        <Select value={query.status ?? ""} onChange={(v) => push({ status: v })} placeholder="Durum">
          {Object.entries(SESSION_STATUS_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </Select>
        <Select value={query.occupancy ?? ""} onChange={(v) => push({ occupancy: v })} placeholder="Doluluk">
          <option value="empty">Boş</option>
          <option value="partial">Kısmen dolu</option>
          <option value="full">Dolu</option>
        </Select>
      </div>

      {dragBusy && <p className="text-xs text-[var(--text-muted)]">Kaydediliyor…</p>}
      {toast && (
        <p className="border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-xs text-[var(--text-primary)]">
          {toast}
        </p>
      )}

      {/* Görünüm — mobilde ay/hafta ızgarası sıkışacağı için listeye düşer */}
      <div className="hidden sm:block">
        {query.view === "month" && <MonthView {...viewProps} />}
        {query.view === "week" && <WeekView {...viewProps} />}
        {query.view === "day" && <DayView {...viewProps} />}
        {query.view === "list" && <ListView {...viewProps} />}
      </div>
      <div className="sm:hidden">
        {query.view === "day" ? <DayView {...viewProps} /> : <ListView {...viewProps} />}
      </div>

      {openId && (
        <EventDetailModal
          sessionId={openId}
          onClose={() => setOpenId(null)}
          onChanged={() => router.refresh()}
          onEdit={openEditFromDetail}
        />
      )}

      {formOpen && (
        <EventFormModal
          programs={programs}
          instructors={options.instructors}
          initial={formInitial}
          defaultDate={query.date}
          onClose={() => setFormOpen(false)}
          onSaved={(message) => {
            setFormOpen(false);
            setToast(message);
            router.refresh();
            setTimeout(() => setToast(null), 5000);
          }}
        />
      )}
    </div>
  );
}

function Select({
  value,
  onChange,
  placeholder,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  );
}
