"use client";

import { useState, useEffect } from "react";
import { CoverImagePicker } from "@/components/admin/cover-image-picker";
import type { CollectionsConfig, CollectionItem } from "@/lib/site-content";
import { slugify } from "@/lib/slug";

const DEFAULT_CONFIG: CollectionsConfig = {
  heading: "Koleksiyonlar",
  description: "Zamansız tasarımlar, el işçiliğiyle hayat bulur.",
  items: [
    { slug: "kolyeler", label: "Kolyeler", bg: "#e2cdb5", imageUrl: null, imageId: null },
    { slug: "yuzukler", label: "Yüzükler", bg: "#d6c9b4", imageUrl: null, imageId: null },
    { slug: "kupeler", label: "Küpeler", bg: "#dfc8ae", imageUrl: null, imageId: null },
    { slug: "bileklikler", label: "Bileklikler", bg: "#cfc5b6", imageUrl: null, imageId: null },
    { slug: "charmlar", label: "Charm'lar", bg: "#d9d3c6", imageUrl: null, imageId: null },
  ],
};


export default function KoleksiyonlarAdminPage() {
  const [config, setConfig] = useState<CollectionsConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/v1/admin/site-content/collections")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.value) {
          const raw = d.data.value as Partial<CollectionsConfig>;
          setConfig({
            ...DEFAULT_CONFIG,
            ...raw,
            items: raw.items ?? DEFAULT_CONFIG.items,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/v1/admin/site-content/collections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: config }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function updateItem(index: number, patch: Partial<CollectionItem>) {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function addItem() {
    setConfig((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { slug: `koleksiyon-${prev.items.length + 1}`, label: "Yeni Koleksiyon", bg: "#e2cdb5", imageUrl: null, imageId: null },
      ],
    }));
  }

  function removeItem(index: number) {
    setConfig((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  }

  function moveItem(index: number, dir: -1 | 1) {
    const items = [...config.items];
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    setConfig((prev) => ({ ...prev, items }));
  }

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="h-8 w-48 animate-pulse bg-[var(--bg-subtle)] rounded mb-6" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 animate-pulse bg-[var(--bg-subtle)] border border-[var(--border)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Koleksiyonlar</h1>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Anasayfadaki koleksiyon kartlarını düzenleyin.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-9 px-5 bg-[var(--text-primary)] text-[11px] font-medium tracking-[0.1em] uppercase text-[var(--surface)] disabled:opacity-50"
        >
          {saving ? "Kaydediliyor..." : saved ? "Kaydedildi ✓" : "Kaydet"}
        </button>
      </div>

      {/* Bölüm başlığı ve açıklama */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-4">
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--text-muted)]">Bölüm Metni</p>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Başlık</label>
          <input
            type="text"
            value={config.heading}
            onChange={(e) => setConfig((p) => ({ ...p, heading: e.target.value }))}
            className="h-9 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Açıklama</label>
          <input
            type="text"
            value={config.description}
            onChange={(e) => setConfig((p) => ({ ...p, description: e.target.value }))}
            className="h-9 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
          />
        </div>
      </div>

      {/* Koleksiyon kartları */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--text-muted)]">
            Kartlar ({config.items.length})
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">İlk 2 kart üst satır, geri kalanlar alt satır</p>
        </div>

        {config.items.map((item, i) => (
          <div
            key={i}
            className="border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded border border-[var(--border)]" style={{ background: item.bg }} />
                <span className="text-[11px] font-medium text-[var(--text-muted)] tabular-nums">#{i + 1}</span>
                {i < 2 && (
                  <span className="text-[9px] font-medium tracking-[0.1em] uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5">Üst satır</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveItem(i, -1)}
                  disabled={i === 0}
                  className="h-6 w-6 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 border border-[var(--border)] text-xs"
                  title="Yukarı taşı"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveItem(i, 1)}
                  disabled={i === config.items.length - 1}
                  className="h-6 w-6 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 border border-[var(--border)] text-xs"
                  title="Aşağı taşı"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeItem(i)}
                  className="h-6 px-2 border border-red-200 text-[10px] text-red-500 hover:border-red-400 ml-1"
                >
                  Sil
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Etiket</label>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => {
                    updateItem(i, { label: e.target.value, slug: slugify(e.target.value) });
                  }}
                  className="h-9 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
                  placeholder="Kolyeler"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Slug</label>
                <input
                  type="text"
                  value={item.slug}
                  onChange={(e) => updateItem(i, { slug: e.target.value })}
                  className="h-9 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
                  placeholder="kolyeler"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Arka Plan Rengi</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={item.bg}
                    onChange={(e) => updateItem(i, { bg: e.target.value })}
                    className="h-9 w-12 border border-[var(--border)] bg-[var(--bg)] cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={item.bg}
                    onChange={(e) => updateItem(i, { bg: e.target.value })}
                    className="flex-1 h-9 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
                    placeholder="#e2cdb5"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-3">
              <CoverImagePicker
                value={item.imageId}
                previewUrl={item.imageUrl}
                onChange={(id, url) => updateItem(i, { imageId: id, imageUrl: url })}
                onClear={() => updateItem(i, { imageId: null, imageUrl: null })}
                aspect={1}
                label="Koleksiyon Görseli"
                hint="Kare (1:1) — önerilen 1200×1200. Görsel yoksa arka plan rengi + halka motifi gösterilir."
              />
            </div>
          </div>
        ))}

        <button
          onClick={addItem}
          className="border border-dashed border-[var(--border)] py-3 text-[11px] font-medium tracking-[0.1em] uppercase text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-colors"
        >
          + Koleksiyon Ekle
        </button>
      </div>

      {/* Varsayılan sıfırlama */}
      <div className="border-t border-[var(--border)] pt-4">
        <button
          onClick={() => setConfig(DEFAULT_CONFIG)}
          className="text-[11px] text-[var(--text-muted)] hover:text-red-600 underline underline-offset-2"
        >
          Varsayılana Sıfırla
        </button>
      </div>
    </div>
  );
}
