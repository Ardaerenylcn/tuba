"use client";

import { useCallback, useEffect, useState } from "react";

interface GiftCard {
  id: string;
  code: string;
  initialValue: number;
  balance: number;
  currency: string;
  purchaserName: string;
  purchaserEmail: string;
  recipientName: string;
  recipientEmail: string;
  message: string | null;
  status: string;
  expiresAt: string;
  createdAt: string;
  usedCount: number;
}

const STATUS_LABELS: Record<string, string> = {
  active: "Aktif",
  depleted: "Bakiye bitti",
  expired: "Süresi doldu",
  cancelled: "İptal",
};
const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  depleted: "bg-stone-100 text-stone-500",
  expired: "bg-orange-50 text-orange-600",
  cancelled: "bg-red-50 text-red-600",
};

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

// Süresi geçmiş ama status hâlâ active görünenleri "expired" göster
function effectiveStatus(c: GiftCard): string {
  if (c.status === "active" && new Date(c.expiresAt) < new Date()) return "expired";
  return c.status;
}

export default function HediyeKartlariPage() {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/admin/gift-cards");
    const data = await res.json();
    if (data.success) setCards(data.data);
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- kasıtlı: mount/veri-yükleme kalıbı
  useEffect(() => { load(); }, [load]);

  async function cancelCard(id: string) {
    if (!confirm("Bu hediye kartını iptal etmek istediğinize emin misiniz? Kalan bakiye kullanılamaz hale gelir.")) return;
    setBusyId(id);
    const res = await fetch(`/api/v1/admin/gift-cards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    const data = await res.json();
    if (data.success) setCards((prev) => prev.map((c) => (c.id === id ? { ...c, status: "cancelled" } : c)));
    setBusyId(null);
  }

  const totalSold = cards.reduce((s, c) => s + c.initialValue, 0);
  const totalOutstanding = cards
    .filter((c) => effectiveStatus(c) === "active")
    .reduce((s, c) => s + c.balance, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-medium text-[var(--text-primary)]">Hediye Kartları</h1>
        <p className="text-sm text-[var(--text-muted)]">{cards.length} kart</p>
      </div>

      {/* Özet */}
      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Toplam Satış</p>
          <p className="mt-1 text-lg font-medium text-[var(--text-primary)]">{totalSold.toLocaleString("tr-TR")} ₺</p>
        </div>
        <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Kullanılmamış Bakiye</p>
          <p className="mt-1 text-lg font-medium text-[var(--text-primary)]">{totalOutstanding.toLocaleString("tr-TR")} ₺</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((n) => <div key={n} className="h-16 animate-pulse bg-[var(--bg-subtle)] border border-[var(--border)]" />)}
        </div>
      ) : cards.length === 0 ? (
        <div className="border border-dashed border-[var(--border)] py-16 text-center">
          <p className="text-sm text-[var(--text-muted)]">Henüz hediye kartı satılmadı.</p>
        </div>
      ) : (
        <div className="border border-[var(--border)] bg-[var(--surface)] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {["Kod", "Tutar / Bakiye", "Alıcı", "Satın alan", "Geçerlilik", "Durum", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {cards.map((c) => {
                const st = effectiveStatus(c);
                return (
                  <tr key={c.id} className="hover:bg-[var(--bg-subtle)]">
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-primary)] whitespace-nowrap">{c.code}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[var(--text-primary)]">{c.balance.toLocaleString("tr-TR")} ₺</span>
                      <span className="text-[var(--text-muted)]"> / {c.initialValue.toLocaleString("tr-TR")} ₺</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[var(--text-primary)]">{c.recipientName}</p>
                      <p className="text-xs text-[var(--text-muted)]">{c.recipientEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[var(--text-primary)]">{c.purchaserName}</p>
                      <p className="text-xs text-[var(--text-muted)]">{c.purchaserEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">{fmtDate(c.expiresAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs ${STATUS_COLORS[st]}`}>{STATUS_LABELS[st] ?? st}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {(st === "active" || st === "depleted") && (
                        <button
                          onClick={() => cancelCard(c.id)}
                          disabled={busyId === c.id}
                          className="text-xs text-red-600 underline underline-offset-4 hover:text-red-700 disabled:opacity-40"
                        >
                          {busyId === c.id ? "..." : "İptal et"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
