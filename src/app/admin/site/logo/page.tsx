"use client";

import { useState, useEffect } from "react";
import { CoverImagePicker } from "@/components/admin/cover-image-picker";
import type { Metadata } from "next";

export default function LogoPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/admin/site-content/logo")
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.value) {
          setImageUrl(d.data.value.imageUrl ?? null);
          setImageId(d.data.value.imageId ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/v1/admin/site-content/logo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: { imageUrl, imageId } }),
      });
      if (!res.ok) throw new Error("Kaydetme başarısız.");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-sm text-[var(--text-muted)]">Yükleniyor…</span>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-medium text-[var(--text-primary)]">Site Logosu</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Header'da "tuba atman jewelry" yazısının yanında gösterilecek logo görseli.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-4">
          <p className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Logo Görseli</p>

          <CoverImagePicker
            value={imageId}
            previewUrl={imageUrl}
            onChange={(id, url) => { setImageId(id); setImageUrl(url); }}
            onClear={() => { setImageId(null); setImageUrl(null); }}
          />

          <p className="text-[11px] text-[var(--text-disabled)]">
            Şeffaf arka planlı PNG veya SVG önerilir. Görsel otomatik olarak 36×36 px boyutuna uyarlanır.
          </p>
        </div>

        {/* Önizleme */}
        {imageUrl && (
          <div className="border border-dashed border-[var(--border)] p-4 flex flex-col gap-2">
            <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Önizleme</p>
            <div className="flex items-center gap-2.5">
              <img
                src={imageUrl}
                alt="Logo önizleme"
                className="h-9 w-9 object-contain"
              />
              <div className="flex flex-col leading-none">
                <span className="text-[15px] text-[var(--text-primary)]" style={{ fontFamily: "Georgia, serif" }}>
                  tuba atman
                </span>
                <span className="text-[11px] tracking-[0.2em] uppercase text-[var(--text-muted)]" style={{ fontFamily: "Georgia, serif" }}>
                  jewelry
                </span>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="h-10 bg-[var(--text-primary)] px-6 text-[11px] font-medium tracking-[0.12em] uppercase text-[var(--surface)] disabled:opacity-50 self-start"
        >
          {saving ? "Kaydediliyor…" : saved ? "Kaydedildi ✓" : "Kaydet"}
        </button>
      </form>
    </div>
  );
}
