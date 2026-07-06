"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CoverImagePicker } from "@/components/admin/cover-image-picker";

interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface ProgramFormProps {
  initial?: {
    id?: string;
    type?: string;
    categoryId?: string | null;
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

// ── Yeni Tür Ekleme Modal ────────────────────────────────────────────────────

function NewCategoryModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (cat: Category) => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [showOnHome, setShowOnHome] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(v: string) {
    setName(v);
    setSlug((prev) =>
      prev === slugify(name) || prev === "" ? slugify(v) : prev
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/v1/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, description: description || null, showOnHome }),
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.message ?? "Bir hata oluştu.");
      setLoading(false);
      return;
    }
    onCreated(data.data as Category);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <p className="text-sm font-medium text-[var(--text-primary)]">Yeni Tür Ekle</p>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-[0.1em]">Tür Adı *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
              placeholder="ör. Takı Kursu"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-[0.1em]">Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
              placeholder="taki-kursu"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-[0.1em]">Açıklama</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
              placeholder="Kısa açıklama (opsiyonel)"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnHome}
              onChange={(e) => setShowOnHome(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm text-[var(--text-secondary)]">Anasayfada göster</span>
          </label>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-9 bg-[var(--text-primary)] text-xs font-medium tracking-[0.1em] uppercase text-[var(--surface)] disabled:opacity-50"
            >
              {loading ? "Oluşturuluyor..." : "Oluştur"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Ana Form ─────────────────────────────────────────────────────────────────

export function ProgramForm({ initial }: ProgramFormProps) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [form, setForm] = useState({
    type: initial?.type ?? "workshop",
    categoryId: initial?.categoryId ?? null as string | null,
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

  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [showNewCat, setShowNewCat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/v1/admin/categories")
      .then((r) => r.json())
      .then((d) => { if (d.success) setCategories(d.data); })
      .finally(() => setCatLoading(false));
  }, []);

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

  function handleCategoryCreated(cat: Category) {
    setCategories((prev) => [...prev, cat]);
    setForm((prev) => ({ ...prev, categoryId: cat.id }));
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
      categoryId: form.categoryId ?? null,
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
    <>
      {showNewCat && (
        <NewCategoryModal
          onClose={() => setShowNewCat(false)}
          onCreated={handleCategoryCreated}
        />
      )}

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── Sol panel ── */}
        <div className="flex flex-col gap-5 border border-[var(--border)] bg-[var(--surface)] p-6">

          {/* Tür (tip) + Kategori — 2 kolon */}
          <div className="grid grid-cols-2 gap-4">
            {/* Program tipi */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
                Program Tipi
              </label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="h-10 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
              >
                <option value="workshop">Atölye</option>
                <option value="certificate">Sertifika</option>
              </select>
            </div>

            {/* Seviye */}
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

          {/* Kategori / Tür seçimi */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
                Tür / Kategori
              </label>
              <button
                type="button"
                onClick={() => setShowNewCat(true)}
                className="text-[11px] font-medium text-[var(--accent)] hover:underline"
              >
                + Yeni Tür Ekle
              </button>
            </div>
            {catLoading ? (
              <div className="h-10 border border-[var(--border)] bg-[var(--bg-subtle)] animate-pulse" />
            ) : (
              <select
                value={form.categoryId ?? ""}
                onChange={(e) => set("categoryId", e.target.value || null)}
                className="h-10 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
              >
                <option value="">— Seçiniz —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            <p className="text-[11px] text-[var(--text-muted)]">
              Seçilen tür anasayfada ilgili bölümde gösterilir.
            </p>
          </div>

          {/* Başlık */}
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

          {/* Kısa açıklama */}
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

        {/* ── Sağ panel ── */}
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
    </>
  );
}
