"use client";

import { useState, useEffect } from "react";
import type { SssItem } from "@/lib/site-content";

const DEFAULT_ITEMS: SssItem[] = [
  { q: "Hiç deneyimim yok, başlayabilir miyim?", a: "Evet, kesinlikle! Atölyelerimizin büyük bölümü hiçbir deneyim gerektirmiyor. Başlangıç seviyesi programlarımız sıfırdan başlayanlar için özel olarak tasarlanmıştır. İlk derste tüm temel teknikleri öğretiyoruz." },
  { q: "Derse hangi malzemeleri getirmem gerekiyor?", a: "Hiçbir şey getirmenize gerek yok. Tüm malzeme ve ekipman atölyemiz tarafından sağlanır. Derste yaptığınız takılar size aittir, evinize götürürsünüz." },
  { q: "Grup büyüklüğü ne kadar?", a: "Atölyelerimizde maksimum 6 kişilik gruplarla çalışıyoruz." },
  { q: "Rezervasyon yapmak için ödeme yapmak zorunda mıyım?", a: "Şu an için rezervasyonunuzu onaylamak ücretsizdir. Ödeme atölye günü yapılabilir." },
  { q: "İptal veya değişiklik yapabilir miyim?", a: "Atölye tarihinden 48 saat öncesine kadar ücretsiz iptal veya tarih değişikliği yapabilirsiniz." },
];

export default function SSSAdminPage() {
  const [items, setItems] = useState<SssItem[]>(DEFAULT_ITEMS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/v1/admin/site-content/sss")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.value?.items) {
          setItems(d.data.value.items as SssItem[]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/v1/admin/site-content/sss", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: { items } }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function updateItem(index: number, patch: Partial<SssItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, { q: "", a: "" }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function moveItem(index: number, dir: -1 | 1) {
    const arr = [...items];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setItems(arr);
  }

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto flex flex-col gap-3">
        <div className="h-8 w-48 animate-pulse bg-[var(--bg-subtle)] rounded" />
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-24 animate-pulse bg-[var(--bg-subtle)] border border-[var(--border)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Sık Sorulan Sorular</h1>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">SSS sayfasındaki soru ve cevapları yönetin.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-9 px-5 bg-[var(--text-primary)] text-[11px] font-medium tracking-[0.1em] uppercase text-[var(--surface)] disabled:opacity-50"
        >
          {saving ? "Kaydediliyor..." : saved ? "Kaydedildi ✓" : "Kaydet"}
        </button>
      </div>

      {/* Sorular */}
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={i} className="border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-3">
            {/* Kontroller */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[var(--text-muted)] tabular-nums">#{i + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveItem(i, -1)}
                  disabled={i === 0}
                  className="h-6 w-6 flex items-center justify-center border border-[var(--border)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30"
                  title="Yukarı"
                >↑</button>
                <button
                  onClick={() => moveItem(i, 1)}
                  disabled={i === items.length - 1}
                  className="h-6 w-6 flex items-center justify-center border border-[var(--border)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30"
                  title="Aşağı"
                >↓</button>
                <button
                  onClick={() => removeItem(i)}
                  className="h-6 px-2 border border-red-200 text-[10px] text-red-500 hover:border-red-400 ml-1"
                >Sil</button>
              </div>
            </div>

            {/* Soru */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Soru</label>
              <input
                type="text"
                value={item.q}
                onChange={(e) => updateItem(i, { q: e.target.value })}
                className="h-9 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
                placeholder="Soru metni..."
              />
            </div>

            {/* Cevap */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Cevap</label>
              <textarea
                value={item.a}
                onChange={(e) => updateItem(i, { a: e.target.value })}
                rows={3}
                className="border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] resize-none leading-relaxed"
                placeholder="Cevap metni..."
              />
            </div>
          </div>
        ))}

        <button
          onClick={addItem}
          className="border border-dashed border-[var(--border)] py-3 text-[11px] font-medium tracking-[0.1em] uppercase text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-colors"
        >
          + Soru Ekle
        </button>
      </div>

      {/* Sıfırla */}
      <div className="border-t border-[var(--border)] pt-4">
        <button
          onClick={() => setItems(DEFAULT_ITEMS)}
          className="text-[11px] text-[var(--text-muted)] hover:text-red-600 underline underline-offset-2"
        >
          Varsayılana Sıfırla
        </button>
      </div>
    </div>
  );
}
