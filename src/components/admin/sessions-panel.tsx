"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

interface SessionRow {
  id: string;
  startAt: string;
  endAt: string;
  capacity: number;
  status: string;
  priceOverride: number | null;
  locationName: string | null;
  notes: string | null;
  _count: { reservations: number };
}

interface SessionsPanelProps {
  programId: string;
  defaultCapacity: number;
  durationMinutes: number;
  basePrice: number;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Taslak",
  published: "Yayında",
  cancelled: "İptal",
  completed: "Tamamlandı",
  full: "Dolu",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-stone-100 text-stone-500",
  published: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
  completed: "bg-stone-100 text-stone-400",
  full: "bg-amber-50 text-amber-700",
};

// 0=Pazar, 1=Pazartesi, ... 6=Cumartesi (JS getUTCDay order)
const DAY_LABELS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul",
  }).format(new Date(iso));
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul",
  }).format(new Date(iso));
}

function toLocalDateStr(iso: string) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Istanbul" }).format(new Date(iso));
}

function toLocalTimeStr(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Istanbul",
  }).format(new Date(iso)).replace(".", ":");
}

function buildISOFromLocalDateTime(dateStr: string, timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h - 3, m, 0, 0)).toISOString();
}

function addMinutes(isoDate: string, minutes: number): string {
  return new Date(new Date(isoDate).getTime() + minutes * 60000).toISOString();
}

function previewCount(startDate: string, endDate: string, daysOfWeek: Set<number>): number {
  if (!startDate || !endDate || daysOfWeek.size === 0 || endDate < startDate) return 0;
  let count = 0;
  const cursor = new Date(`${startDate}T00:00:00Z`);
  const last = new Date(`${endDate}T00:00:00Z`);
  let guard = 0;
  while (cursor <= last && guard < 400) {
    if (daysOfWeek.has(cursor.getUTCDay())) count++;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    guard++;
  }
  return count;
}

const EMPTY_FORM = {
  date: "",
  startTime: "",
  endTime: "",
  capacity: 0,
  status: "published" as string,
  priceOverride: "" as string | number,
  locationName: "",
  notes: "",
};

const EMPTY_BULK = {
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  capacity: 0,
  status: "published" as string,
  priceOverride: "" as string | number,
  locationName: "",
};

export function SessionsPanel({ programId, defaultCapacity, durationMinutes, basePrice }: SessionsPanelProps) {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  // "none" | "single" | "bulk"
  const [addMode, setAddMode] = useState<"none" | "single" | "bulk">("none");

  const [addForm, setAddForm] = useState({ ...EMPTY_FORM, capacity: defaultCapacity });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [bulkForm, setBulkForm] = useState({ ...EMPTY_BULK, capacity: defaultCapacity });
  const [bulkDays, setBulkDays] = useState<Set<number>>(new Set([0, 1, 2, 3, 4, 5, 6]));
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM, capacity: defaultCapacity });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/v1/admin/programs/${programId}/sessions`);
    const data = await res.json();
    if (data.success) setSessions(data.data);
    setLoading(false);
  }, [programId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- kasıtlı: mount/veri-yükleme kalıbı
  useEffect(() => { load(); }, [load]);

  const bulkPreview = useMemo(
    () => previewCount(bulkForm.startDate, bulkForm.endDate, bulkDays),
    [bulkForm.startDate, bulkForm.endDate, bulkDays],
  );

  function toggleMode(mode: "single" | "bulk") {
    setAddMode((prev) => (prev === mode ? "none" : mode));
    setAddError(null);
    setBulkError(null);
  }

  function toggleDay(day: number) {
    setBulkDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) { next.delete(day); } else { next.add(day); }
      return next;
    });
  }

  function handleStartTimeChange(
    time: string,
    form: typeof EMPTY_FORM,
    setForm: (f: typeof EMPTY_FORM) => void,
  ) {
    if (!form.date || !time) { setForm({ ...form, startTime: time }); return; }
    const startIso = buildISOFromLocalDateTime(form.date, time);
    const endIso = addMinutes(startIso, durationMinutes);
    setForm({ ...form, startTime: time, endTime: toLocalTimeStr(endIso) });
  }

  function handleBulkStartTimeChange(time: string) {
    if (!bulkForm.startDate || !time) { setBulkForm({ ...bulkForm, startTime: time }); return; }
    const startIso = buildISOFromLocalDateTime(bulkForm.startDate, time);
    const endIso = addMinutes(startIso, durationMinutes);
    setBulkForm({ ...bulkForm, startTime: time, endTime: toLocalTimeStr(endIso) });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.date || !addForm.startTime || !addForm.endTime) {
      setAddError("Tarih ve saatler zorunludur.");
      return;
    }
    setAddLoading(true);
    setAddError(null);
    const res = await fetch(`/api/v1/admin/programs/${programId}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startAt: buildISOFromLocalDateTime(addForm.date, addForm.startTime),
        endAt: buildISOFromLocalDateTime(addForm.date, addForm.endTime),
        capacity: Number(addForm.capacity),
        status: addForm.status,
        priceOverride: addForm.priceOverride !== "" ? Number(addForm.priceOverride) : null,
        locationName: addForm.locationName || null,
        notes: addForm.notes || null,
      }),
    });
    const data = await res.json();
    setAddLoading(false);
    if (!data.success) { setAddError(data.message ?? "Hata oluştu."); return; }
    setAddMode("none");
    setAddForm({ ...EMPTY_FORM, capacity: defaultCapacity });
    load();
  }

  async function handleBulk(e: React.FormEvent) {
    e.preventDefault();
    if (bulkDays.size === 0) { setBulkError("En az bir gün seçin."); return; }
    if (!bulkForm.startTime || !bulkForm.endTime) { setBulkError("Saatler zorunludur."); return; }
    setBulkLoading(true);
    setBulkError(null);
    const res = await fetch(`/api/v1/admin/programs/${programId}/sessions/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: bulkForm.startDate,
        endDate: bulkForm.endDate,
        daysOfWeek: Array.from(bulkDays),
        startTime: bulkForm.startTime,
        endTime: bulkForm.endTime,
        capacity: Number(bulkForm.capacity),
        status: bulkForm.status,
        priceOverride: bulkForm.priceOverride !== "" ? Number(bulkForm.priceOverride) : null,
        locationName: bulkForm.locationName || null,
      }),
    });
    const data = await res.json();
    setBulkLoading(false);
    if (!data.success) { setBulkError(data.message ?? "Hata oluştu."); return; }
    setAddMode("none");
    setBulkForm({ ...EMPTY_BULK, capacity: defaultCapacity });
    setBulkDays(new Set([0, 1, 2, 3, 4, 5, 6]));
    load();
  }

  function startEdit(s: SessionRow) {
    setEditingId(s.id);
    setEditForm({
      date: toLocalDateStr(s.startAt),
      startTime: toLocalTimeStr(s.startAt),
      endTime: toLocalTimeStr(s.endAt),
      capacity: s.capacity,
      status: s.status,
      priceOverride: s.priceOverride ?? "",
      locationName: s.locationName ?? "",
      notes: s.notes ?? "",
    });
    setEditError(null);
  }

  async function handleEdit(e: React.FormEvent, id: string) {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    const res = await fetch(`/api/v1/admin/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startAt: buildISOFromLocalDateTime(editForm.date, editForm.startTime),
        endAt: buildISOFromLocalDateTime(editForm.date, editForm.endTime),
        capacity: Number(editForm.capacity),
        status: editForm.status,
        priceOverride: editForm.priceOverride !== "" ? Number(editForm.priceOverride) : null,
        locationName: editForm.locationName || null,
        notes: editForm.notes || null,
      }),
    });
    const data = await res.json();
    setEditLoading(false);
    if (!data.success) { setEditError(data.message ?? "Hata oluştu."); return; }
    setEditingId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu oturumu silmek istiyor musunuz?")) return;
    const res = await fetch(`/api/v1/admin/sessions/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) { alert(data.message ?? "Silinemedi."); return; }
    load();
  }

  const now = new Date();
  const upcoming = sessions.filter((s) => new Date(s.endAt) >= now);
  const past = sessions.filter((s) => new Date(s.endAt) < now);

  return (
    <div className="flex flex-col gap-4 border border-[var(--border)] bg-[var(--surface)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-[var(--text-primary)]">Oturumlar</h2>
          <p className="text-xs text-[var(--text-muted)]">{sessions.length} oturum</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleMode("bulk")}
            className={`inline-flex h-8 items-center gap-1.5 border px-4 text-xs font-medium tracking-[0.08em] uppercase transition-colors ${
              addMode === "bulk"
                ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--surface)]"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Toplu Ekle
          </button>
          <button
            type="button"
            onClick={() => toggleMode("single")}
            className={`inline-flex h-8 items-center gap-1.5 px-4 text-xs font-medium tracking-[0.08em] uppercase transition-colors ${
              addMode === "single"
                ? "bg-[var(--color-stone-700)] text-[var(--surface)]"
                : "bg-[var(--text-primary)] text-[var(--surface)] hover:bg-[var(--color-stone-700)]"
            }`}
          >
            {addMode === "single" ? "İptal" : "+ Oturum Ekle"}
          </button>
        </div>
      </div>

      {/* Single add form */}
      {addMode === "single" && (
        <form onSubmit={handleAdd} className="border border-dashed border-[var(--border)] p-4 flex flex-col gap-4">
          <p className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Yeni Oturum</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Tarih *</label>
              <input
                type="date" required value={addForm.date}
                onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Başlangıç *</label>
              <input
                type="time" required value={addForm.startTime}
                onChange={(e) => handleStartTimeChange(e.target.value, addForm, (f) => setAddForm(f as typeof EMPTY_FORM))}
                className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Bitiş *</label>
              <input
                type="time" required value={addForm.endTime}
                onChange={(e) => setAddForm({ ...addForm, endTime: e.target.value })}
                className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Durum</label>
              <select value={addForm.status} onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]">
                <option value="draft">Taslak</option>
                <option value="published">Yayında</option>
                <option value="cancelled">İptal</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Kapasite</label>
              <input type="number" min={1} max={50} value={addForm.capacity}
                onChange={(e) => setAddForm({ ...addForm, capacity: Number(e.target.value) })}
                className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Fiyat (₺)</label>
              <input type="number" min={0} step={50} placeholder={String(basePrice)} value={addForm.priceOverride}
                onChange={(e) => setAddForm({ ...addForm, priceOverride: e.target.value })}
                className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Konum</label>
              <input type="text" placeholder="Atölye adı" value={addForm.locationName}
                onChange={(e) => setAddForm({ ...addForm, locationName: e.target.value })}
                className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
            </div>
          </div>
          {addError && <p className="text-xs text-red-600">{addError}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={addLoading}
              className="h-9 bg-[var(--text-primary)] px-6 text-xs font-medium tracking-[0.08em] uppercase text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)] disabled:opacity-50">
              {addLoading ? "Kaydediliyor..." : "Oturum Oluştur"}
            </button>
          </div>
        </form>
      )}

      {/* Bulk add form */}
      {addMode === "bulk" && (
        <form onSubmit={handleBulk} className="border border-dashed border-[var(--border)] p-4 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Toplu Oturum Oluştur</p>
            <button type="button" onClick={() => setAddMode("none")} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              İptal
            </button>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Başlangıç Tarihi *</label>
              <input type="date" required value={bulkForm.startDate}
                onChange={(e) => setBulkForm({ ...bulkForm, startDate: e.target.value })}
                className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Bitiş Tarihi *</label>
              <input type="date" required value={bulkForm.endDate}
                onChange={(e) => setBulkForm({ ...bulkForm, endDate: e.target.value })}
                className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
            </div>
          </div>

          {/* Day selector */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Haftanın Günleri *</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setBulkDays(new Set([0,1,2,3,4,5,6]))}
                  className="text-[10px] text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)]">Tümü</button>
                <button type="button" onClick={() => setBulkDays(new Set([1,2,3,4,5]))}
                  className="text-[10px] text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)]">Hafta içi</button>
                <button type="button" onClick={() => setBulkDays(new Set([0,6]))}
                  className="text-[10px] text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)]">Hafta sonu</button>
              </div>
            </div>
            <div className="flex gap-2">
              {DAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors border ${
                    bulkDays.has(i)
                      ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--surface)]"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-primary)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Başlangıç Saati *</label>
              <input type="time" required value={bulkForm.startTime}
                onChange={(e) => handleBulkStartTimeChange(e.target.value)}
                className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Bitiş Saati *</label>
              <input type="time" required value={bulkForm.endTime}
                onChange={(e) => setBulkForm({ ...bulkForm, endTime: e.target.value })}
                className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Kapasite</label>
              <input type="number" min={1} max={50} value={bulkForm.capacity}
                onChange={(e) => setBulkForm({ ...bulkForm, capacity: Number(e.target.value) })}
                className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Durum</label>
              <select value={bulkForm.status} onChange={(e) => setBulkForm({ ...bulkForm, status: e.target.value })}
                className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]">
                <option value="published">Yayında</option>
                <option value="draft">Taslak</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Fiyat (₺, opsiyonel)</label>
              <input type="number" min={0} step={50} placeholder={String(basePrice)} value={bulkForm.priceOverride}
                onChange={(e) => setBulkForm({ ...bulkForm, priceOverride: e.target.value })}
                className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Konum</label>
              <input type="text" placeholder="Atölye adı veya adres" value={bulkForm.locationName}
                onChange={(e) => setBulkForm({ ...bulkForm, locationName: e.target.value })}
                className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
            </div>
          </div>

          {bulkError && <p className="text-xs text-red-600">{bulkError}</p>}

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
            <p className="text-sm text-[var(--text-muted)]">
              {bulkPreview > 0 ? (
                <><span className="font-medium text-[var(--text-primary)]">{bulkPreview} oturum</span> oluşturulacak</>
              ) : (
                "Tarih ve gün seçin"
              )}
            </p>
            <button type="submit" disabled={bulkLoading || bulkPreview === 0}
              className="h-9 bg-[var(--text-primary)] px-6 text-xs font-medium tracking-[0.08em] uppercase text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)] disabled:opacity-40">
              {bulkLoading ? "Oluşturuluyor..." : `${bulkPreview} Oturum Oluştur`}
            </button>
          </div>
        </form>
      )}

      {/* Sessions list */}
      {loading ? (
        <p className="py-6 text-center text-xs text-[var(--text-muted)]">Yükleniyor...</p>
      ) : sessions.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--text-muted)]">
          Henüz oturum yok. Yukarıdan tekli veya toplu oturum ekleyin.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {upcoming.length > 0 && (
            <SessionGroup
              label="Yaklaşan"
              sessions={upcoming}
              editingId={editingId}
              editForm={editForm}
              editLoading={editLoading}
              editError={editError}
              basePrice={basePrice}
              onStartEdit={startEdit}
              onCancelEdit={() => setEditingId(null)}
              onEditFormChange={(f) => setEditForm(f)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStartTimeChange={(t) => handleStartTimeChange(t, editForm, (f) => setEditForm(f as typeof EMPTY_FORM))}
            />
          )}
          {past.length > 0 && (
            <SessionGroup
              label="Geçmiş"
              sessions={past}
              editingId={editingId}
              editForm={editForm}
              editLoading={editLoading}
              editError={editError}
              basePrice={basePrice}
              onStartEdit={startEdit}
              onCancelEdit={() => setEditingId(null)}
              onEditFormChange={(f) => setEditForm(f)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStartTimeChange={(t) => handleStartTimeChange(t, editForm, (f) => setEditForm(f as typeof EMPTY_FORM))}
              muted
            />
          )}
        </div>
      )}
    </div>
  );
}

interface GroupProps {
  label: string;
  sessions: SessionRow[];
  editingId: string | null;
  editForm: typeof EMPTY_FORM;
  editLoading: boolean;
  editError: string | null;
  basePrice: number;
  muted?: boolean;
  onStartEdit: (s: SessionRow) => void;
  onCancelEdit: () => void;
  onEditFormChange: (f: typeof EMPTY_FORM) => void;
  onEdit: (e: React.FormEvent, id: string) => void;
  onDelete: (id: string) => void;
  onStartTimeChange: (t: string) => void;
}

function SessionGroup({
  label, sessions, editingId, editForm, editLoading, editError, basePrice, muted,
  onStartEdit, onCancelEdit, onEditFormChange, onEdit, onDelete, onStartTimeChange,
}: GroupProps) {
  return (
    <div>
      <p className={`mb-3 text-[10px] font-medium tracking-[0.15em] uppercase ${muted ? "text-[var(--text-disabled)]" : "text-[var(--text-muted)]"}`}>
        {label}
      </p>
      <div className={`flex flex-col divide-y divide-[var(--border)] border border-[var(--border)] ${muted ? "opacity-60" : ""}`}>
        {sessions.map((s) =>
          editingId === s.id ? (
            <form key={s.id} onSubmit={(e) => onEdit(e, s.id)} className="p-4 flex flex-col gap-3 bg-[var(--bg-subtle)]">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Tarih</label>
                  <input type="date" required value={editForm.date}
                    onChange={(e) => onEditFormChange({ ...editForm, date: e.target.value })}
                    className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Başlangıç</label>
                  <input type="time" required value={editForm.startTime}
                    onChange={(e) => onStartTimeChange(e.target.value)}
                    className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Bitiş</label>
                  <input type="time" required value={editForm.endTime}
                    onChange={(e) => onEditFormChange({ ...editForm, endTime: e.target.value })}
                    className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Durum</label>
                  <select value={editForm.status} onChange={(e) => onEditFormChange({ ...editForm, status: e.target.value })}
                    className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]">
                    <option value="draft">Taslak</option>
                    <option value="published">Yayında</option>
                    <option value="cancelled">İptal</option>
                    <option value="completed">Tamamlandı</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Kapasite</label>
                  <input type="number" min={1} max={50} value={editForm.capacity}
                    onChange={(e) => onEditFormChange({ ...editForm, capacity: Number(e.target.value) })}
                    className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Fiyat (₺)</label>
                  <input type="number" min={0} step={50} placeholder={String(basePrice)} value={editForm.priceOverride}
                    onChange={(e) => onEditFormChange({ ...editForm, priceOverride: e.target.value })}
                    className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Konum</label>
                  <input type="text" value={editForm.locationName}
                    onChange={(e) => onEditFormChange({ ...editForm, locationName: e.target.value })}
                    className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
                </div>
              </div>
              {editError && <p className="text-xs text-red-600">{editError}</p>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={onCancelEdit} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">İptal</button>
                <button type="submit" disabled={editLoading}
                  className="h-8 bg-[var(--text-primary)] px-5 text-xs font-medium tracking-[0.08em] uppercase text-[var(--surface)] disabled:opacity-50">
                  {editLoading ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          ) : (
            <div key={s.id} className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--bg-subtle)]">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">{formatDate(s.startAt)}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {formatTime(s.startAt)} – {formatTime(s.endAt)}
                  {s.locationName && ` · ${s.locationName}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--text-muted)]">{s._count.reservations}/{s.capacity} kişi</span>
                <span className={`text-[10px] px-2 py-0.5 ${STATUS_COLORS[s.status] ?? "bg-stone-100 text-stone-500"}`}>
                  {STATUS_LABELS[s.status] ?? s.status}
                </span>
                <button type="button" onClick={() => onStartEdit(s)}
                  className="text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)]">
                  Düzenle
                </button>
                <button type="button" onClick={() => onDelete(s.id)}
                  className="text-xs text-red-400 hover:text-red-600">
                  Sil
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
