"use client";

import { useEffect, useState } from "react";
import {
  PAYMENT_STATUS_LABELS,
  RESERVATION_STATUS_BADGE,
  RESERVATION_STATUS_LABELS,
  SESSION_STATUS_LABELS,
  occupancyTone,
} from "./status-labels";

interface Reservation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  participantCount: number;
  status: string;
  paymentStatus: string;
  priceSnapshot: number;
  notes: string | null;
  createdAt: string;
}

interface SessionDetail {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  capacity: number;
  booked: number;
  waitlisted: number;
  available: number;
  locationName: string | null;
  locationAddress: string | null;
  notes: string | null;
  basePrice: number;
  priceOverride: number | null;
  program: { id: string; title: string; type: string; slug: string; shortDescription: string };
  instructor: { id: string; name: string } | null;
  reservations: Reservation[];
}

/** Rezervasyon için admin'in yapabileceği durum geçişleri. */
const RESERVATION_ACTIONS: { status: string; label: string; danger?: boolean; confirm?: string }[] = [
  { status: "confirmed", label: "Onayla" },
  { status: "completed", label: "Tamamlandı" },
  { status: "no_show", label: "Katılmadı" },
  {
    status: "cancelled",
    label: "İptal et",
    danger: true,
    confirm: "Bu rezervasyon iptal edilecek. Emin misiniz?",
  },
];

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/**
 * Takvimde bir etkinliğe tıklandığında açılan detay paneli.
 *
 * Veriyi tıklanınca çeker (ay görünümünde onlarca oturumun katılımcısını
 * peşin yüklemek gereksiz olurdu). Rezervasyon durum değişiklikleri mevcut
 * PATCH /api/v1/admin/reservations/[id] ucunu kullanır.
 */
export function EventDetailModal({
  sessionId,
  onClose,
  onChanged,
}: {
  sessionId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  /** Yenileme sayacı — durum değişince artırılır, effect yeniden çeker. */
  const [reloadKey, setReloadKey] = useState(0);

  // setState yalnızca promise callback'lerinde çağrılır; effect gövdesinde
  // senkron setState zincirleme render tetikliyor (React kuralı).
  useEffect(() => {
    let alive = true;
    fetch(`/api/v1/admin/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        if (!data.success) throw new Error(data.message ?? "Oturum yüklenemedi.");
        setDetail(data.data as SessionDetail);
        setError(null);
      })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : "Oturum yüklenemedi.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [sessionId, reloadKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function setReservationStatus(r: Reservation, status: string, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusyId(r.id);
    try {
      const res = await fetch(`/api/v1/admin/reservations/${r.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Güncellenemedi.");
      setFlash(
        status === "confirmed" ? "Rezervasyon onaylandı."
        : status === "cancelled" ? "Rezervasyon iptal edildi."
        : "Rezervasyon durumu güncellendi.",
      );
      setReloadKey((k) => k + 1);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata.");
    } finally {
      setBusyId(null);
      setTimeout(() => setFlash(null), 3000);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Etkinlik detayı"
    >
      <div
        className="w-full max-w-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
              {loading ? "Yükleniyor…" : (detail?.program.title ?? "Oturum")}
            </p>
            {detail && (
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                {fmtDateTime(detail.startAt)} –{" "}
                {new Date(detail.endAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="shrink-0 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-12 animate-pulse bg-[var(--bg-subtle)]" />
              ))}
            </div>
          )}

          {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
          {flash && <p className="mb-3 text-sm text-green-700">{flash}</p>}

          {detail && (
            <>
              <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Info label="Kontenjan" value={String(detail.capacity)} />
                <Info
                  label="Dolu"
                  value={`${detail.booked}`}
                  tone={occupancyTone(detail.booked, detail.capacity)}
                />
                <Info label="Boş" value={String(detail.available)} />
                <Info label="Durum" value={SESSION_STATUS_LABELS[detail.status] ?? detail.status} />
                <Info label="Eğitmen" value={detail.instructor?.name ?? "—"} />
                <Info label="Konum" value={detail.locationName ?? "—"} />
                <Info
                  label="Fiyat"
                  value={`${(detail.priceOverride ?? detail.basePrice).toLocaleString("tr-TR")} ₺`}
                />
                <Info label="Bekleme listesi" value={String(detail.waitlisted)} />
              </div>

              {detail.notes && (
                <p className="mb-5 border-l-2 border-[var(--border)] pl-3 text-xs text-[var(--text-muted)]">
                  {detail.notes}
                </p>
              )}

              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Katılımcılar ({detail.reservations.length})
              </p>

              {detail.reservations.length === 0 ? (
                <p className="py-6 text-center text-sm text-[var(--text-muted)]">
                  Bu oturumda rezervasyon yok.
                </p>
              ) : (
                <div className="flex flex-col divide-y divide-[var(--border)] border border-[var(--border)]">
                  {detail.reservations.map((r) => (
                    <div key={r.id} className="flex flex-col gap-2 p-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-[var(--text-primary)]">
                            {r.customerName}
                            {r.participantCount > 1 && (
                              <span className="ml-1 text-xs text-[var(--text-muted)]">
                                ({r.participantCount} kişi)
                              </span>
                            )}
                          </p>
                          <p className="truncate text-[11px] text-[var(--text-muted)]">
                            {r.customerEmail} · {r.customerPhone}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] ${RESERVATION_STATUS_BADGE[r.status] ?? ""}`}>
                            {RESERVATION_STATUS_LABELS[r.status] ?? r.status}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {PAYMENT_STATUS_LABELS[r.paymentStatus] ?? r.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {r.notes && (
                        <p className="text-[11px] text-[var(--text-muted)]">Not: {r.notes}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="mr-1 text-[10px] text-[var(--text-disabled)]">
                          {new Date(r.createdAt).toLocaleDateString("tr-TR")}
                        </span>
                        {RESERVATION_ACTIONS.filter((a) => a.status !== r.status).map((a) => (
                          <button
                            key={a.status}
                            type="button"
                            disabled={busyId === r.id}
                            onClick={() => setReservationStatus(r, a.status, a.confirm)}
                            className={`h-6 px-2 text-[10px] transition-colors disabled:opacity-40 ${
                              a.danger
                                ? "border border-red-200 text-red-600 hover:bg-red-50"
                                : "border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
                            }`}
                          >
                            {busyId === r.id ? "…" : a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {detail && (
          <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-3">
            <a
              href={`/${detail.program.type}/${detail.program.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text-primary)]"
            >
              Sitedeki sayfası →
            </a>
            <a
              href={`/admin/programlar/${detail.program.id}`}
              className="text-[11px] text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text-primary)]"
            >
              Programı düzenle →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className={`mt-0.5 truncate text-sm ${tone ?? "text-[var(--text-primary)]"}`}>{value}</p>
    </div>
  );
}
