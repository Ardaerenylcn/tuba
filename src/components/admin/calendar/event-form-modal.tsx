"use client";

import { useState } from "react";

export interface ProgramOption {
  id: string;
  title: string;
  type: string;
  defaultCapacity: number | null;
  durationMinutes: number | null;
  basePrice: number;
}

export interface EventFormInitial {
  sessionId: string;
  programId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  instructorId: string;
  locationName: string;
  locationAddress: string;
  priceOverride: string;
  status: string;
  notes: string;
}

const TR_DAYS = [
  { dow: 1, label: "Pzt" }, { dow: 2, label: "Sal" }, { dow: 3, label: "Çar" },
  { dow: 4, label: "Per" }, { dow: 5, label: "Cum" }, { dow: 6, label: "Cmt" },
  { dow: 0, label: "Paz" },
];

const inputCls =
  "h-9 w-full border border-[var(--border)] bg-[var(--bg)] px-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--text-muted)]">
        {label}
      </span>
      {children}
      {hint && <span className="text-[10px] text-[var(--text-muted)]">{hint}</span>}
    </label>
  );
}

/**
 * Oturum oluşturma / düzenleme formu.
 *
 * Etkinlik = programın tarihli örneği: ad, açıklama, görsel gibi alanlar
 * programa aittir ve burada TEKRARLANMAZ; form yalnızca programı seçtirir ve
 * o tarihe özgü alanları düzenler.
 *
 * "Tekrarla" açıkken mevcut bulk ucu kullanılır (belirli günler + tarih
 * aralığı); kapalıyken tek oturum oluşturulur.
 */
export function EventFormModal({
  programs,
  instructors,
  initial,
  defaultDate,
  onClose,
  onSaved,
}: {
  programs: ProgramOption[];
  instructors: { id: string; name: string }[];
  initial?: EventFormInitial;
  defaultDate: string;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const isEdit = !!initial;

  const [programId, setProgramId] = useState(initial?.programId ?? programs[0]?.id ?? "");
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [startTime, setStartTime] = useState(initial?.startTime ?? "10:00");
  const [endTime, setEndTime] = useState(initial?.endTime ?? "13:00");
  const [capacity, setCapacity] = useState(String(initial?.capacity ?? 6));
  const [instructorId, setInstructorId] = useState(initial?.instructorId ?? "");
  const [locationName, setLocationName] = useState(initial?.locationName ?? "");
  const [locationAddress, setLocationAddress] = useState(initial?.locationAddress ?? "");
  const [priceOverride, setPriceOverride] = useState(initial?.priceOverride ?? "");
  const [status, setStatus] = useState(initial?.status ?? "published");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  // Tekrar (yalnızca yeni oturumda)
  const [repeat, setRepeat] = useState(false);
  const [repeatUntil, setRepeatUntil] = useState("");
  const [days, setDays] = useState<number[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = programs.find((p) => p.id === programId);

  /**
   * Program değişince kontenjan ve bitiş saati programın varsayılanlarından
   * doldurulur. Bu bir effect'te değil, olay içinde yapılır: effect'te state
   * türetmek zincirleme render'a yol açıyor (React kuralı) ve admin'in elle
   * girdiği değeri de ezerdi.
   */
  function changeProgram(nextId: string) {
    setProgramId(nextId);
    const p = programs.find((x) => x.id === nextId);
    if (!p || isEdit) return;
    if (p.defaultCapacity) setCapacity(String(p.defaultCapacity));
    if (p.durationMinutes) {
      const [h, m] = startTime.split(":").map(Number);
      const end = new Date(2000, 0, 1, h, m + p.durationMinutes);
      setEndTime(`${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`);
    }
  }

  function toggleDay(dow: number) {
    setDays((prev) => (prev.includes(dow) ? prev.filter((d) => d !== dow) : [...prev, dow]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!programId) { setError("Program seçin."); return; }
    if (endTime <= startTime) { setError("Bitiş saati başlangıçtan sonra olmalı."); return; }
    if (repeat && !repeatUntil) { setError("Tekrar için bitiş tarihi girin."); return; }
    if (repeat && days.length === 0) { setError("Tekrar için en az bir gün seçin."); return; }

    setSaving(true);
    try {
      const price = priceOverride.trim() === "" ? null : Number(priceOverride);
      let res: Response;

      if (isEdit) {
        res = await fetch(`/api/v1/admin/sessions/${initial.sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startAt: new Date(`${date}T${startTime}`).toISOString(),
            endAt: new Date(`${date}T${endTime}`).toISOString(),
            capacity: Number(capacity),
            status,
            priceOverride: price,
            locationName: locationName || null,
            locationAddress: locationAddress || null,
            notes: notes || null,
            instructorId: instructorId || null,
          }),
        });
      } else if (repeat) {
        res = await fetch(`/api/v1/admin/programs/${programId}/sessions/bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startDate: date,
            endDate: repeatUntil,
            daysOfWeek: days,
            startTime,
            endTime,
            capacity: Number(capacity),
            status: status === "published" ? "published" : "draft",
            priceOverride: price,
            locationName: locationName || null,
            instructorId: instructorId || null,
          }),
        });
      } else {
        res = await fetch(`/api/v1/admin/programs/${programId}/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startAt: new Date(`${date}T${startTime}`).toISOString(),
            endAt: new Date(`${date}T${endTime}`).toISOString(),
            capacity: Number(capacity),
            status: status === "completed" ? "draft" : status,
            priceOverride: price,
            locationName: locationName || null,
            locationAddress: locationAddress || null,
            notes: notes || null,
            instructorId: instructorId || null,
          }),
        });
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Kaydedilemedi.");
      // Sunucu çakışma ve katılımcı uyarılarını mesajda döndürüyor; olduğu gibi taşınır.
      onSaved(data.message ?? "Kaydedildi.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Oturumu düzenle" : "Yeni oturum"}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg border border-[var(--border)] bg-[var(--surface)] shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {isEdit ? "Oturumu Düzenle" : "Yeni Oturum"}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field
                label="Program *"
                hint={
                  isEdit
                    ? "Oturumun programı değiştirilemez."
                    : selected
                    ? `Temel fiyat ${selected.basePrice.toLocaleString("tr-TR")} ₺ · ad, açıklama ve görsel programdan gelir`
                    : undefined
                }
              >
                <select
                  value={programId}
                  onChange={(e) => changeProgram(e.target.value)}
                  disabled={isEdit}
                  className={`${inputCls} disabled:opacity-60`}
                >
                  {programs.length === 0 && <option value="">Önce program oluşturun</option>}
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Tarih *">
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Kontenjan *">
              <input type="number" required min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Başlangıç *">
              <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Bitiş *">
              <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls} />
            </Field>

            <Field label="Eğitmen">
              <select value={instructorId} onChange={(e) => setInstructorId(e.target.value)} className={inputCls}>
                <option value="">— seçilmedi —</option>
                {instructors.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </Field>
            <Field label="Durum">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
                <option value="draft">Taslak</option>
                <option value="published">Yayında</option>
                {isEdit && <option value="cancelled">İptal edildi</option>}
                {isEdit && <option value="completed">Tamamlandı</option>}
              </select>
            </Field>

            <Field label="Konum">
              <input type="text" value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="Atölye" className={inputCls} />
            </Field>
            <Field label="Fiyat farkı" hint="Boşsa programın fiyatı">
              <input type="number" min={0} step="0.01" value={priceOverride} onChange={(e) => setPriceOverride(e.target.value)} placeholder="—" className={inputCls} />
            </Field>

            {!repeat && (
              <div className="col-span-2">
                <Field label="Adres">
                  <input type="text" value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} className={inputCls} />
                </Field>
              </div>
            )}

            <div className="col-span-2">
              <Field label="Not">
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputCls} h-auto py-2`} />
              </Field>
            </div>
          </div>

          {!isEdit && (
            <div className="mt-4 border-t border-[var(--border)] pt-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} className="h-4 w-4" />
                <span className="text-xs text-[var(--text-secondary)]">
                  Tekrarla — seçilen günlerde, tarih aralığı boyunca
                </span>
              </label>

              {repeat && (
                <div className="mt-3 flex flex-col gap-3">
                  <div className="flex flex-wrap gap-1">
                    {TR_DAYS.map((d) => (
                      <button
                        key={d.dow}
                        type="button"
                        onClick={() => toggleDay(d.dow)}
                        aria-pressed={days.includes(d.dow)}
                        className={`h-7 w-10 border text-[11px] transition-colors ${
                          days.includes(d.dow)
                            ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--surface)]"
                            : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <Field label="Bitiş tarihi *" hint="Her seçilen gün için ayrı oturum oluşturulur (en fazla 200).">
                    <input type="date" value={repeatUntil} min={date} onChange={(e) => setRepeatUntil(e.target.value)} className={inputCls} />
                  </Field>
                </div>
              )}
            </div>
          )}

          {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] px-5 py-3">
          <button type="button" onClick={onClose} className="h-9 px-4 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            İptal
          </button>
          <button
            type="submit"
            disabled={saving || programs.length === 0}
            className="h-9 bg-[var(--text-primary)] px-5 text-xs font-medium tracking-[0.1em] uppercase text-[var(--surface)] disabled:opacity-50"
          >
            {saving ? "Kaydediliyor…" : isEdit ? "Kaydet" : repeat ? "Oturumları Oluştur" : "Oluştur"}
          </button>
        </div>
      </form>
    </div>
  );
}
