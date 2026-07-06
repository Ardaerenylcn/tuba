"use client";

import { useState, useEffect } from "react";

interface NewsletterConfig {
  heading: string;
  description: string;
  instagramUrl: string;
  pinterestUrl: string;
  youtubeUrl: string;
  email: string;
}

const DEFAULTS: NewsletterConfig = {
  heading: "Yeniliklerden Haberdar Ol",
  description:
    "Koleksiyonlar, atölye duyuruları ve özel indirimlerden ilk sen haberdar ol.",
  instagramUrl: "#",
  pinterestUrl: "#",
  youtubeUrl: "#",
  email: "info@tubaatman.com",
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

export default function BultenPage() {
  const [form, setForm] = useState<NewsletterConfig>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/admin/site-content/newsletter")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.value) {
          setForm({ ...DEFAULTS, ...(d.data.value as Partial<NewsletterConfig>) });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof NewsletterConfig>(key: K, value: NewsletterConfig[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/v1/admin/site-content/newsletter", {
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
      <div className="p-6 max-w-2xl mx-auto flex flex-col gap-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-12 animate-pulse bg-[var(--bg-subtle)] border border-[var(--border)]" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="p-6 max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Bülten & Sosyal Medya</h1>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Anasayfanın alt kısmındaki bülten bölümünü düzenleyin.
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

      {/* Metin */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-5">
        <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]">
          Metin
        </p>

        <Field label="Başlık">
          <input
            type="text"
            value={form.heading}
            onChange={(e) => set("heading", e.target.value)}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
          />
        </Field>

        <Field label="Açıklama">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] resize-none"
          />
        </Field>
      </div>

      {/* Sosyal medya linkleri */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-5">
        <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]">
          Sosyal Medya Linkleri
        </p>

        <Field label="Instagram URL" hint="Tam URL — örn: https://instagram.com/tubaatmanjewelry">
          <input
            type="url"
            value={form.instagramUrl}
            onChange={(e) => set("instagramUrl", e.target.value)}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            placeholder="https://instagram.com/..."
          />
        </Field>

        <Field label="Pinterest URL">
          <input
            type="url"
            value={form.pinterestUrl}
            onChange={(e) => set("pinterestUrl", e.target.value)}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            placeholder="https://pinterest.com/..."
          />
        </Field>

        <Field label="YouTube URL">
          <input
            type="url"
            value={form.youtubeUrl}
            onChange={(e) => set("youtubeUrl", e.target.value)}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            placeholder="https://youtube.com/..."
          />
        </Field>

        <Field label="E-posta adresi" hint="E-posta ikonu tıklandığında açılacak adres">
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            placeholder="info@tubaatman.com"
          />
        </Field>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && (
        <p className="text-sm text-green-700">Değişiklikler kaydedildi. Anasayfayı yenileyin.</p>
      )}

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
