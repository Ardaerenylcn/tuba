"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Option {
  id: string;
  startAt: string;
  endAt: string;
  locationName: string | null;
  instructor: string | null;
  availableSpots: number;
}

const TZ = "Europe/Istanbul";
function fmt(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(new Date(iso));
}

export function RescheduleControl({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<Option[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    if (open) { setOpen(false); return; }
    setOpen(true); setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/v1/reservations/${reservationId}/reschedule`);
      const data = await res.json();
      if (!data.success) { setError(data.message ?? "Uygun tarih yüklenemedi."); setOptions([]); return; }
      setOptions(data.data as Option[]);
    } catch {
      setError("Bağlantı hatası."); setOptions([]);
    } finally {
      setLoading(false);
    }
  }

  async function pick(targetSessionId: string) {
    if (!confirm("Rezervasyonunuz seçtiğiniz tarihe taşınacak. Onaylıyor musunuz?")) return;
    setSaving(targetSessionId); setError(null);
    try {
      const res = await fetch(`/api/v1/reservations/${reservationId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetSessionId }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message ?? "Taşınamadı."); return; }
      router.refresh();
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={load}
        className="inline-flex items-center gap-1.5 border border-[var(--border)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
      >
        🗓 Tarihi Değiştir
      </button>

      {open && (
        <div className="border border-[var(--border)] bg-[var(--bg)] p-3">
          {loading ? (
            <p className="text-[11px] text-[var(--text-muted)]">Uygun tarihler yükleniyor…</p>
          ) : options && options.length > 0 ? (
            <ul className="flex flex-col divide-y divide-[var(--border)]">
              {options.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="text-[12px] text-[var(--text-primary)]">{fmt(o.startAt)}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {o.locationName ? `${o.locationName} · ` : ""}{o.availableSpots} yer{o.instructor ? ` · ${o.instructor}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => pick(o.id)}
                    disabled={!!saving}
                    className="shrink-0 bg-[var(--text-primary)] px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--surface)] disabled:opacity-50"
                  >
                    {saving === o.id ? "..." : "Seç"}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-[var(--text-muted)]">Taşınabilecek uygun başka tarih yok.</p>
          )}
          {error && <p className="mt-2 text-[11px] text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
