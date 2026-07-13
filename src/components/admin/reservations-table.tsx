"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReservationActions } from "./reservation-actions";

export interface ReservationRow {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string | null;
  programTitle: string;
  startAt: string;
  participantCount: number;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Bekliyor", confirmed: "Onaylandı", cancelled: "İptal", refunded: "İade",
  waitlisted: "Bekleme", no_show: "Gelmedi", completed: "Tamamlandı",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700", confirmed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600", refunded: "bg-stone-100 text-stone-600",
  waitlisted: "bg-blue-50 text-blue-700", no_show: "bg-stone-100 text-stone-500",
  completed: "bg-stone-100 text-stone-600",
};
const PAYMENT_LABELS: Record<string, string> = {
  not_required: "—", pending: "Bekliyor", paid: "Ödendi", failed: "Başarısız",
  refunded: "İade", partially_refunded: "Kısmi İade",
};
const BULK_OPTIONS = [
  { value: "confirmed", label: "Onayla" },
  { value: "completed", label: "Tamamlandı işaretle" },
  { value: "no_show", label: "Gelmedi işaretle" },
  { value: "cancelled", label: "İptal et" },
];

function fmtDT(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }).format(new Date(iso));
}
function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

export function ReservationsTable({ rows }: { rows: ReservationRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("confirmed");
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected(allChecked ? new Set() : new Set(rows.map((r) => r.id)));
  }

  async function apply() {
    if (selected.size === 0) return;
    const label = BULK_OPTIONS.find((o) => o.value === bulkStatus)?.label ?? bulkStatus;
    if (!confirm(`${selected.size} rezervasyon için "${label}" uygulanacak. Onaylıyor musunuz?`)) return;
    setApplying(true); setError(null);
    try {
      const res = await fetch("/api/v1/admin/reservations/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selected], status: bulkStatus }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message ?? "İşlem başarısız."); return; }
      setSelected(new Set());
      router.refresh();
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setApplying(false);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] py-16">
        <p className="text-sm text-[var(--text-muted)]">Bu filtrede rezervasyon yok.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toplu işlem çubuğu */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-4 py-2.5">
          <span className="text-xs font-medium text-[var(--text-primary)]">{selected.size} seçili</span>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="h-8 border border-[var(--border)] bg-[var(--bg)] px-2 text-xs text-[var(--text-primary)]">
            {BULK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={apply} disabled={applying} className="h-8 bg-[var(--text-primary)] px-4 text-xs font-medium text-[var(--surface)] disabled:opacity-50">
            {applying ? "Uygulanıyor..." : "Uygula"}
          </button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text-primary)]">
            Seçimi temizle
          </button>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      )}

      <div className="border border-[var(--border)] bg-[var(--surface)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Tümünü seç" className="h-4 w-4" />
                </th>
                {["Müşteri", "Program / Oturum", "Kişi", "Toplam", "Durum", "Ödeme", "Tarih", "İşlem"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rows.map((r) => (
                <tr key={r.id} className={`hover:bg-[var(--bg-subtle)] ${selected.has(r.id) ? "bg-[var(--bg-subtle)]" : ""}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} aria-label={`${r.customerName} seç`} className="h-4 w-4" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--text-primary)]">{r.customerName}</p>
                    <p className="text-xs text-[var(--text-muted)]">{r.customerEmail}</p>
                    <p className="text-xs text-[var(--text-muted)]">{r.customerPhone}</p>
                    {r.notes && <p className="mt-1 max-w-[200px] truncate text-[10px] italic text-[var(--text-disabled)]" title={r.notes}>{r.notes}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[var(--text-primary)]">{r.programTitle}</p>
                    <p className="text-xs text-[var(--text-muted)]">{fmtDT(r.startAt)}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{r.participantCount}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{r.total.toLocaleString("tr-TR")} ₺</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs ${STATUS_COLORS[r.status] ?? ""}`}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs text-[var(--text-muted)]">{PAYMENT_LABELS[r.paymentStatus] ?? r.paymentStatus}</span></td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{fmtDate(r.createdAt)}</td>
                  <td className="px-4 py-3"><ReservationActions id={r.id} status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
