"use client";

import { useState } from "react";

interface DiscountCode {
  id: string;
  code: string;
  type: string;
  value: number;
  maxUses: number | null;
  usedCount: number;
  minOrderAmount: number | null;
  expiresAt: Date | null;
  active: boolean;
  createdAt: Date;
}

const EMPTY = { code: "", type: "percent" as "percent" | "fixed", value: "", maxUses: "", minOrderAmount: "", expiresAt: "" };

export function DiscountCodesClient({ initial }: { initial: DiscountCode[] }) {
  const [codes, setCodes] = useState(initial);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);

  function showFlash(ok: boolean, text: string) {
    setFlash({ ok, text });
    setTimeout(() => setFlash(null), 3000);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/discount-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: Number(form.value),
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!data.success) { showFlash(false, data.message ?? "Hata."); return; }
      setCodes((prev) => [data.data, ...prev]);
      setForm(EMPTY);
      showFlash(true, "Kod oluşturuldu.");
    } catch { showFlash(false, "Sunucu hatası."); }
    finally { setSaving(false); }
  }

  async function toggleActive(id: string, active: boolean) {
    const res = await fetch(`/api/v1/admin/discount-codes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    const data = await res.json();
    if (data.success) setCodes((prev) => prev.map((c) => c.id === id ? { ...c, active: !active } : c));
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu kodu silmek istediğinizden emin misiniz?")) return;
    const res = await fetch(`/api/v1/admin/discount-codes/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) setCodes((prev) => prev.filter((c) => c.id !== id));
    else showFlash(false, data.message ?? "Silinemedi.");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium text-[var(--text-primary)]">İndirim Kodları</h1>
          <p className="text-sm text-[var(--text-muted)]">{codes.length} kod</p>
        </div>
        {flash && <span className={`text-xs ${flash.ok ? "text-green-700" : "text-red-600"}`}>{flash.text}</span>}
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} className="border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Yeni Kod</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Kod *</label>
            <input required value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
              className="border border-[var(--border)] bg-transparent px-2 py-1.5 text-xs uppercase focus:outline-none focus:border-[var(--text-primary)]" placeholder="YILBASI20" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Tür *</label>
            <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as "percent" | "fixed" }))}
              className="border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--text-primary)]">
              <option value="percent">Yüzde (%)</option>
              <option value="fixed">Sabit (₺)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Değer *</label>
            <input required type="number" min="0" step="0.01" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
              className="border border-[var(--border)] bg-transparent px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--text-primary)]" placeholder={form.type === "percent" ? "20" : "100"} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Maks. Kullanım</label>
            <input type="number" min="1" value={form.maxUses} onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value }))}
              className="border border-[var(--border)] bg-transparent px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--text-primary)]" placeholder="Sınırsız" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Min. Sipariş ₺</label>
            <input type="number" min="0" value={form.minOrderAmount} onChange={(e) => setForm((p) => ({ ...p, minOrderAmount: e.target.value }))}
              className="border border-[var(--border)] bg-transparent px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--text-primary)]" placeholder="—" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Bitiş Tarihi</label>
            <input type="date" value={form.expiresAt} onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
              className="border border-[var(--border)] bg-transparent px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--text-primary)]" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button type="submit" disabled={saving}
            className="inline-flex h-8 items-center bg-[var(--text-primary)] px-4 text-xs text-[var(--surface)] disabled:opacity-40">
            {saving ? "Kaydediliyor…" : "Oluştur"}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="border border-[var(--border)] bg-[var(--surface)] overflow-x-auto">
        {codes.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-[var(--text-muted)]">Henüz kod yok.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {["Kod", "Tür / Değer", "Kullanım", "Min. Sipariş", "Bitiş", "Durum", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {codes.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--bg-subtle)]">
                  <td className="px-4 py-3 font-mono text-sm font-medium text-[var(--text-primary)]">{c.code}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {c.type === "percent" ? `%${c.value}` : `${Number(c.value).toLocaleString("tr-TR")} ₺`}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {c.minOrderAmount ? `${Number(c.minOrderAmount).toLocaleString("tr-TR")} ₺` : "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("tr-TR") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(c.id, c.active)}
                      className={`inline-flex items-center px-2 py-0.5 text-xs ${c.active ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                      {c.active ? "Aktif" : "Pasif"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(c.id)} className="text-xs text-red-500 hover:text-red-700">Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
