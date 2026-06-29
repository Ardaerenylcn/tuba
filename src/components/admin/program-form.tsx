"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CoverImagePicker } from "@/components/admin/cover-image-picker";

interface ProgramFormProps {
  initial?: {
    id?: string;
    type?: string;
    title?: string;
    slug?: string;
    shortDescription?: string;
    basePrice?: number;
    currency?: string;
    defaultCapacity?: number;
    durationMinutes?: number;
    level?: string;
    status?: string;
    seoTitle?: string;
    seoDescription?: string;
    coverImageId?: string | null;
    coverImageUrl?: string | null;
    coverImagePosition?: string | null;
  };
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProgramForm({ initial }: ProgramFormProps) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [form, setForm] = useState({
    type: initial?.type ?? "workshop",
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    shortDescription: initial?.shortDescription ?? "",
    basePrice: initial?.basePrice ?? 0,
    currency: initial?.currency ?? "TRY",
    defaultCapacity: initial?.defaultCapacity ?? 6,
    durationMinutes: initial?.durationMinutes ?? 180,
    level: initial?.level ?? "all_levels",
    status: initial?.status ?? "draft",
    seoTitle: initial?.seoTitle ?? "",
    seoDescription: initial?.seoDescription ?? "",
    coverImageId: initial?.coverImageId ?? null as string | null,
    coverImageUrl: initial?.coverImageUrl ?? null as string | null,
    coverImagePosition: initial?.coverImagePosition ?? "center center",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTitleChange(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slug === slugify(prev.title) || prev.slug === "" ? slugify(title) : prev.slug,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors([]);

    const url = isEdit ? `/api/v1/admin/programs/${initial!.id}` : "/api/v1/admin/programs";
    const method = isEdit ? "PATCH" : "POST";

    const { coverImageUrl: _url, ...rest } = form;
    const payload = {
      ...rest,
      description: { type: "doc", content: [] },
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
      coverImageId: form.coverImageId ?? null,
      coverImagePosition: form.coverImagePosition || "center center",
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!data.success) {
      setError(data.message ?? "Bir hata oluştu.");
      if (data.errors?.length) setFieldErrors(data.errors);
      setLoading(false);
      return;
    }

    router.push("/admin/programlar");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      {/* Main */}
      <div className="flex flex-col gap-5 border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Type */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Tür</label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className="h-10 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            >
              <option value="workshop">Atölye</option>
              <option value="certificate">Sertifika</option>
            </select>
          </div>

          {/* Level */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Seviye</label>
            <select
              value={form.level}
              onChange={(e) => set("level", e.target.value)}
              className="h-10 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            >
              <option value="all_levels">Her Seviye</option>
              <option value="beginner">Başlangıç</option>
              <option value="intermediate">Orta</option>
              <option value="advanced">İleri</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Başlık *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="h-10 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            placeholder="Program başlığı"
          />
        </div>

        {/* Slug */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Slug *</label>
          <input
            type="text"
            required
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            className="h-10 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            placeholder="program-slug"
          />
        </div>

        {/* Short description */}
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <label className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Kısa Açıklama *</label>
            <span className="text-xs text-[var(--text-muted)]">{form.shortDescription.length}/500</span>
          </div>
          <textarea
            required
            rows={3}
            minLength={10}
            maxLength={500}
            value={form.shortDescription}
            onChange={(e) => set("shortDescription", e.target.value)}
            className="border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] resize-none"
            placeholder="Program hakkında kısa bir açıklama (en az 10 karakter)..."
          />
        </div>

        {/* SEO */}
        <div className="border-t border-[var(--border)] pt-5">
          <p className="mb-4 text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">SEO</p>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={form.seoTitle}
              onChange={(e) => set("seoTitle", e.target.value)}
              className="h-10 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
              placeholder="SEO başlığı (boş bırakılırsa program adı kullanılır)"
            />
            <textarea
              rows={2}
              value={form.seoDescription}
              onChange={(e) => set("seoDescription", e.target.value)}
              className="border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] resize-none"
              placeholder="SEO açıklaması"
            />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-4">
        <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
          <CoverImagePicker
            value={form.coverImageId}
            previewUrl={form.coverImageUrl}
            onChange={(id, url) => setForm((prev) => ({ ...prev, coverImageId: id, coverImageUrl: url }))}
            onClear={() => setForm((prev) => ({ ...prev, coverImageId: null, coverImageUrl: null }))}
          />
        </div>

        <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="mb-4 text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Yayın</p>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[var(--text-muted)]">Durum</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="h-10 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
              >
                <option value="draft">Taslak</option>
                <option value="published">Yayında</option>
                <option value="archived">Arşiv</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="mb-4 text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Fiyat & Kapasite</p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[var(--text-muted)]">Fiyat (₺)</label>
              <input
                type="number"
                min={0}
                step={50}
                value={form.basePrice}
                onChange={(e) => set("basePrice", Number(e.target.value))}
                className="h-10 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[var(--text-muted)]">Varsayılan Kapasite</label>
              <input
                type="number"
                min={1}
                max={50}
                value={form.defaultCapacity}
                onChange={(e) => set("defaultCapacity", Number(e.target.value))}
                className="h-10 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[var(--text-muted)]">Süre (dakika)</label>
              <input
                type="number"
                min={30}
                step={30}
                value={form.durationMinutes}
                onChange={(e) => set("durationMinutes", Number(e.target.value))}
                className="h-10 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
              />
            </div>
          </div>
        </div>

        {error && (
          <div role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p className="font-medium">{error}</p>
            {fieldErrors.length > 0 && (
              <ul className="mt-1 list-inside list-disc text-xs space-y-0.5">
                {fieldErrors.map((e) => <li key={e}>{e}</li>)}
              </ul>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-10 w-full bg-[var(--text-primary)] text-xs font-medium tracking-[0.1em] uppercase text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)] disabled:opacity-50"
        >
          {loading ? "Kaydediliyor..." : isEdit ? "Kaydet" : "Oluştur"}
        </button>
      </div>
    </form>
  );
}
