"use client";

import { useEffect, useState } from "react";

export interface EditableReservation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  participantCount: number;
  notes: string | null;
}

interface SessionOption {
  id: string;
  programTitle: string;
  startAt: string;
  capacity: number;
  booked: number;
  available: number;
  locationName: string | null;
}

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
 * Katılımcı bilgisi düzenleme ve başka oturuma aktarma.
 *
 * Aktarmada `priceSnapshot` bilinçli olarak korunur: kişinin anlaştığı tutar
 * hedef oturumun fiyatıyla kendiliğinden değişmemeli. Kontenjan ve "aynı
 * kişi aynı oturumda iki kez olamaz" kuralı sunucuda denetlenir; buradaki
 * uyarılar yalnızca kullanıcıyı erken bilgilendirmek için.
 */
export function ReservationEditModal({
  reservation,
  currentSessionId,
  onClose,
  onSaved,
}: {
  reservation: EditableReservation;
  currentSessionId: string;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [name, setName] = useState(reservation.customerName);
  const [email, setEmail] = useState(reservation.customerEmail);
  const [phone, setPhone] = useState(reservation.customerPhone);
  const [count, setCount] = useState(String(reservation.participantCount));
  const [notes, setNotes] = useState(reservation.notes ?? "");
  const [sessionId, setSessionId] = useState(currentSessionId);

  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/v1/admin/sessions")
      .then((r) => r.json())
      .then((data) => {
        if (alive && data.success) setSessions(data.data as SessionOption[]);
      })
      .catch(() => { /* seçici boş kalır; aktarma yapılmadan kaydetmek yine mümkün */ });
    return () => { alive = false; };
  }, []);

  const isTransfer = sessionId !== currentSessionId;
  const target = sessions.find((s) => s.id === sessionId);
  const wanted = Number(count) || 0;
  const roomWarning =
    isTransfer && target && wanted > target.available
      ? `Hedef oturumda ${target.available} kişilik yer var, bu kayıt ${wanted} kişilik.`
      : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          participantCount: Number(count),
          notes: notes || null,
          ...(isTransfer ? { sessionId } : {}),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Kaydedilemedi.");
      onSaved(data.message ?? "Kaydedildi.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Katılımcıyı düzenle"
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md border border-[var(--border)] bg-[var(--surface)] shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <p className="text-sm font-medium text-[var(--text-primary)]">Katılımcıyı Düzenle</p>
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
              <Field label="Ad Soyad *">
                <input type="text" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="E-posta *" hint="Aynı kişi aynı oturumda iki kez kayıtlı olamaz.">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
              </Field>
            </div>
            <Field label="Telefon *">
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Kişi sayısı *" hint="Kontenjan kişi üzerinden sayılır.">
              <input type="number" required min={1} max={50} value={count} onChange={(e) => setCount(e.target.value)} className={inputCls} />
            </Field>
            <div className="col-span-2">
              <Field label="Not">
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputCls} h-auto py-2`} />
              </Field>
            </div>
          </div>

          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <Field
              label="Oturum"
              hint={
                isTransfer
                  ? "Aktarmada ödenen/anlaşılan tutar korunur, hedef oturumun fiyatına göre değişmez."
                  : "Başka bir oturum seçerseniz katılımcı oraya aktarılır."
              }
            >
              <select value={sessionId} onChange={(e) => setSessionId(e.target.value)} className={inputCls}>
                <option value={currentSessionId}>— bu oturumda kalsın —</option>
                {sessions
                  .filter((s) => s.id !== currentSessionId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.startAt).toLocaleString("tr-TR", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                      {" · "}{s.programTitle}
                      {" · "}{s.available} boş
                      {s.locationName ? ` · ${s.locationName}` : ""}
                    </option>
                  ))}
              </select>
            </Field>
          </div>

          {roomWarning && (
            <p className="mt-3 border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
              ⚠ {roomWarning}
            </p>
          )}
          {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] px-5 py-3">
          <button type="button" onClick={onClose} className="h-9 px-4 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            İptal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-9 bg-[var(--text-primary)] px-5 text-xs font-medium tracking-[0.1em] uppercase text-[var(--surface)] disabled:opacity-50"
          >
            {saving ? "Kaydediliyor…" : isTransfer ? "Aktar ve Kaydet" : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
