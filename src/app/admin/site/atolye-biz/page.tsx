"use client";

import { useState, useEffect } from "react";
import { CoverImagePicker } from "@/components/admin/cover-image-picker";

interface CardConfig {
  title: string;
  sub: string;
  imageUrl: string | null;
  imageId: string | null;
}

interface AtolyeBizConfig {
  heading: string;
  description: string;
  linkText: string;
  workshops: CardConfig;
  certificates: CardConfig;
}

const DEFAULTS: AtolyeBizConfig = {
  heading: "Atölye Biz",
  description:
    "Takı tasarımını keşfetmek, üretim süreçlerini öğrenmek ve kendi parçanı yaratmak için programlarımıza katılabilirsin.",
  linkText: "Tüm Programları İncele →",
  workshops: {
    title: "Atölyeler",
    sub: "Takı tasarımı ve el işçiliği atölyeleri",
    imageUrl: null,
    imageId: null,
  },
  certificates: {
    title: "Sertifikalar",
    sub: "Profesyonel sertifika programları",
    imageUrl: null,
    imageId: null,
  },
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

export default function AtolyeBizPage() {
  const [form, setForm] = useState<AtolyeBizConfig>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/admin/site-content/atolye_biz")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.value) {
          setForm({ ...DEFAULTS, ...(d.data.value as Partial<AtolyeBizConfig>) });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function setTop<K extends keyof AtolyeBizConfig>(key: K, value: AtolyeBizConfig[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function setCard(which: "workshops" | "certificates", patch: Partial<CardConfig>) {
    setForm((prev) => ({
      ...prev,
      [which]: { ...prev[which], ...patch },
    }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/v1/admin/site-content/atolye_biz", {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Atölye Biz Bölümü</h1>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Anasayfadaki Atölye Biz bölümünü düzenleyin.
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

      {/* Sol metin */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-5">
        <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]">
          Sol Metin
        </p>

        <Field label="Başlık">
          <input
            type="text"
            value={form.heading}
            onChange={(e) => setTop("heading", e.target.value)}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            placeholder="Atölye Biz"
          />
        </Field>

        <Field label="Açıklama">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setTop("description", e.target.value)}
            className="border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] resize-none"
          />
        </Field>

        <Field label="Link metni" hint="Örn: Tüm Programları İncele →">
          <input
            type="text"
            value={form.linkText}
            onChange={(e) => setTop("linkText", e.target.value)}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
          />
        </Field>
      </div>

      {/* Atölyeler kartı */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-5">
        <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]">
          Atölyeler Kartı
        </p>

        <Field label="Kart başlığı">
          <input
            type="text"
            value={form.workshops.title}
            onChange={(e) => setCard("workshops", { title: e.target.value })}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
          />
        </Field>

        <Field label="Kart alt metni">
          <input
            type="text"
            value={form.workshops.sub}
            onChange={(e) => setCard("workshops", { sub: e.target.value })}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
          />
        </Field>

        <CoverImagePicker
          value={form.workshops.imageId}
          previewUrl={form.workshops.imageUrl}
          onChange={(id, url) => setCard("workshops", { imageId: id, imageUrl: url })}
          onClear={() => setCard("workshops", { imageId: null, imageUrl: null })}
        />
        <p className="text-[11px] text-[var(--text-disabled)]">
          Boş bırakılırsa veritabanındaki ilk atölye programı görseli kullanılır.
        </p>
      </div>

      {/* Sertifikalar kartı */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-5">
        <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]">
          Sertifikalar Kartı
        </p>

        <Field label="Kart başlığı">
          <input
            type="text"
            value={form.certificates.title}
            onChange={(e) => setCard("certificates", { title: e.target.value })}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
          />
        </Field>

        <Field label="Kart alt metni">
          <input
            type="text"
            value={form.certificates.sub}
            onChange={(e) => setCard("certificates", { sub: e.target.value })}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
          />
        </Field>

        <CoverImagePicker
          value={form.certificates.imageId}
          previewUrl={form.certificates.imageUrl}
          onChange={(id, url) => setCard("certificates", { imageId: id, imageUrl: url })}
          onClear={() => setCard("certificates", { imageId: null, imageUrl: null })}
        />
        <p className="text-[11px] text-[var(--text-disabled)]">
          Boş bırakılırsa veritabanındaki ilk sertifika programı görseli kullanılır.
        </p>
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
