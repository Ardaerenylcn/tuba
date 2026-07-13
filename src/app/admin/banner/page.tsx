"use client";

import { useState, useEffect } from "react";
import { CoverImagePicker } from "@/components/admin/cover-image-picker";

interface BannerConfig {
  imageUrl: string;
  imageId: string | null;
  eyebrow: string;
  title: string;
  location: string;
  description: string;
  btn1Text: string;
  btn1Href: string;
  btn2Text: string;
  btn2Href: string;
}

const DEFAULTS: BannerConfig = {
  imageUrl: "/pic_01.jpeg",
  imageId: null,
  eyebrow: "Sevgiyle el yapımı ♥",
  title: "ATÖLYE BİZ",
  location: "İstanbul'da",
  description: "Çağdaş takı tasarımını, el işçiliğini ve yaratıcı atölye deneyimlerini birlikte keşfedelim.",
  btn1Text: "Keşfet",
  btn1Href: "/atolyeler",
  btn2Text: "İletişim",
  btn2Href: "/iletisim",
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[var(--text-disabled)]">{hint}</p>}
    </div>
  );
}

export default function BannerPage() {
  const [form, setForm] = useState<BannerConfig>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/admin/site-content/hero_banner")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.value) {
          setForm({ ...DEFAULTS, ...(d.data.value as Partial<BannerConfig>) });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof BannerConfig>(key: K, value: BannerConfig[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/v1/admin/site-content/hero_banner", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: form, status: "published" }),
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.message ?? "Kaydedilemedi.");
    } else {
      setSaved(true);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto flex flex-col gap-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-12 animate-pulse bg-[var(--bg-subtle)] border border-[var(--border)]" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Giriş Bannerı</h1>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Anasayfanın tam ekran giriş görselini ve metnini düzenleyin.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] underline underline-offset-2"
        >
          Önizleme →
        </a>
      </div>

      {/* Görsel */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-3">
        <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]">
          Arka Plan Görseli
        </p>
        <CoverImagePicker
          value={form.imageId}
          previewUrl={form.imageUrl}
          onChange={(id, url) => setForm((prev) => ({ ...prev, imageId: id, imageUrl: url, }))}
          onClear={() => setForm((prev) => ({ ...prev, imageId: null, imageUrl: DEFAULTS.imageUrl }))}
          aspect={16 / 9}
        />
        <p className="text-[11px] text-[var(--text-disabled)]">
          Galerideki bir görseli seçin ya da yeni yükleyin. Önerilen: en az 1920×1080px.
        </p>
      </div>

      {/* Metin içerikleri */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-5">
        <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]">
          Metin
        </p>

        <Field label="Üst metin (eyebrow)" hint="Küçük harf, büyük harf serbest — boş bırakılabilir">
          <input
            type="text"
            value={form.eyebrow}
            onChange={(e) => set("eyebrow", e.target.value)}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            placeholder="Sevgiyle el yapımı ♥"
          />
        </Field>

        <Field label="Ana başlık *">
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            placeholder="ATÖLYE BİZ"
          />
        </Field>

        <Field label="Konum / alt başlık" hint="Başlığın altında küçük yazıyla görünür — boş bırakılabilir">
          <input
            type="text"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            placeholder="İstanbul'da"
          />
        </Field>

        <Field label="Açıklama metni" hint="Boş bırakılabilir">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] resize-none"
            placeholder="Kısa açıklama..."
          />
        </Field>
      </div>

      {/* Butonlar */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-5">
        <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]">
          Butonlar
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="1. Buton metni" hint="Boş bırakılırsa görünmez">
            <input
              type="text"
              value={form.btn1Text}
              onChange={(e) => set("btn1Text", e.target.value)}
              className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
              placeholder="Keşfet"
            />
          </Field>
          <Field label="1. Buton linki">
            <input
              type="text"
              value={form.btn1Href}
              onChange={(e) => set("btn1Href", e.target.value)}
              className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
              placeholder="/atolyeler"
            />
          </Field>
          <Field label="2. Buton metni" hint="Boş bırakılırsa görünmez">
            <input
              type="text"
              value={form.btn2Text}
              onChange={(e) => set("btn2Text", e.target.value)}
              className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
              placeholder="İletişim"
            />
          </Field>
          <Field label="2. Buton linki">
            <input
              type="text"
              value={form.btn2Href}
              onChange={(e) => set("btn2Href", e.target.value)}
              className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
              placeholder="/iletisim"
            />
          </Field>
        </div>
      </div>

      {/* Hata / başarı */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {saved && (
        <p className="text-sm text-green-700">Değişiklikler kaydedildi. Anasayfayı yenileyin.</p>
      )}

      {/* Kaydet */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="h-10 px-8 bg-[var(--text-primary)] text-[11px] font-medium tracking-[0.12em] uppercase text-[var(--surface)] disabled:opacity-50"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <button
          type="button"
          onClick={() => { setForm(DEFAULTS); setSaved(false); }}
          className="h-10 px-5 border border-[var(--border)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          Varsayılana Sıfırla
        </button>
      </div>
    </form>
  );
}
