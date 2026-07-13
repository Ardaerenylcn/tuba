"use client";

import { useState } from "react";

const inputCls =
  "h-11 w-full border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]";
const labelCls = "mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]";

export function WaitlistForm({ sessionId, maxParticipants }: { sessionId: string; maxParticipants: number }) {
  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerPhone: "", participantCount: 1, notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/v1/reservations/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, ...form }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message ?? "Bir hata oluştu."); return; }
      setDone(true);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 border border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-[var(--accent)]">✓</div>
        <p className="text-lg font-medium text-[var(--text-primary)]">Bekleme listesine eklendiniz</p>
        <p className="max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
          Bu seansta yer açılırsa sizinle iletişime geçeceğiz. İlginiz için teşekkürler.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Bu seans şu an dolu. Bekleme listesine katılın; bir yer açılırsa öncelikli olarak size haber verelim.
      </div>

      <div>
        <label className={labelCls}>Ad Soyad</label>
        <input required value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} className={inputCls} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>E-posta</label>
          <input required type="email" value={form.customerEmail} onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Telefon</label>
          <input required value={form.customerPhone} onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))} className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Kişi sayısı</label>
        <select value={form.participantCount} onChange={(e) => setForm((f) => ({ ...f, participantCount: Number(e.target.value) }))} className={inputCls}>
          {Array.from({ length: Math.max(1, Math.min(20, maxParticipants || 10)) }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls}>Not (opsiyonel)</label>
        <textarea rows={2} maxLength={500} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          className="w-full resize-none border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="h-11 bg-[var(--text-primary)] text-xs font-semibold uppercase tracking-[0.15em] text-[var(--surface)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50">
        {loading ? "Gönderiliyor..." : "Bekleme Listesine Katıl"}
      </button>
    </form>
  );
}
