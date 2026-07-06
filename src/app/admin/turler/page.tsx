"use client";

import { useState, useEffect, useCallback } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  showOnHome: boolean;
  isActive: boolean;
  createdAt: string;
  _count: { programs: number };
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Inline form (hem oluşturma hem düzenleme için) ───────────────────────────

function CategoryForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Category>;
  onSave: (cat: Category) => void;
  onCancel: () => void;
}) {
  const isEdit = !!initial?.id;
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [showOnHome, setShowOnHome] = useState(initial?.showOnHome ?? true);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(v: string) {
    setName(v);
    if (!isEdit) setSlug((prev) => (prev === slugify(name) || prev === "" ? slugify(v) : prev));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const url = isEdit ? `/api/v1/admin/categories/${initial!.id}` : "/api/v1/admin/categories";
    const method = isEdit ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, description: description || null, showOnHome, isActive }),
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.message ?? "Bir hata oluştu.");
      setLoading(false);
      return;
    }
    onSave(data.data as Category);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-4"
    >
      <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[var(--text-primary)]">
        {isEdit ? "Türü Düzenle" : "Yeni Tür"}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Ad *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="h-9 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            placeholder="ör. Takı Kursu"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Slug *</label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="h-9 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            placeholder="taki-kursu"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Açıklama</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-9 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
          placeholder="Kısa açıklama"
        />
      </div>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showOnHome} onChange={(e) => setShowOnHome(e.target.checked)} className="h-4 w-4" />
          <span className="text-[13px] text-[var(--text-secondary)]">Anasayfada göster</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4" />
          <span className="text-[13px] text-[var(--text-secondary)]">Aktif</span>
        </label>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="h-9 px-5 bg-[var(--text-primary)] text-[11px] font-medium tracking-[0.1em] uppercase text-[var(--surface)] disabled:opacity-50"
        >
          {loading ? "Kaydediliyor..." : isEdit ? "Kaydet" : "Oluştur"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-4 border border-[var(--border)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          İptal
        </button>
      </div>
    </form>
  );
}

// ── Ana sayfa ────────────────────────────────────────────────────────────────

export default function TurlerPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/admin/categories");
    const data = await res.json();
    if (data.success) setCategories(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleCreated(cat: Category) {
    setCategories((prev) => [...prev, cat]);
    setShowCreate(false);
  }

  function handleUpdated(cat: Category) {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
    setEditId(null);
  }

  async function handleDelete(id: string) {
    setDeleteLoading(true);
    setDeleteError(null);
    const res = await fetch(`/api/v1/admin/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) {
      setDeleteError(data.message ?? "Silinemedi.");
      setDeleteLoading(false);
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setDeleteId(null);
    setDeleteLoading(false);
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Program Türleri</h1>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Anasayfada gösterilecek program türlerini yönetin.
          </p>
        </div>
        {!showCreate && (
          <button
            onClick={() => { setShowCreate(true); setEditId(null); }}
            className="h-9 px-4 bg-[var(--text-primary)] text-[11px] font-medium tracking-[0.1em] uppercase text-[var(--surface)]"
          >
            + Yeni Tür
          </button>
        )}
      </div>

      {/* Oluşturma formu */}
      {showCreate && (
        <CategoryForm onSave={handleCreated} onCancel={() => setShowCreate(false)} />
      )}

      {/* Liste */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 animate-pulse bg-[var(--bg-subtle)] border border-[var(--border)]" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="border border-dashed border-[var(--border)] py-16 text-center">
          <p className="text-sm text-[var(--text-muted)]">Henüz tür eklenmedi.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 text-xs font-medium text-[var(--accent)] hover:underline"
          >
            İlk türü oluştur →
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {categories.map((cat) =>
            editId === cat.id ? (
              <CategoryForm
                key={cat.id}
                initial={cat}
                onSave={handleUpdated}
                onCancel={() => setEditId(null)}
              />
            ) : (
              <div
                key={cat.id}
                className="flex items-center gap-4 border border-[var(--border)] bg-[var(--surface)] px-5 py-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-[var(--text-primary)]">{cat.name}</p>
                    <span className="font-mono text-[10px] text-[var(--text-muted)] bg-[var(--bg-subtle)] px-1.5 py-0.5">
                      {cat.slug}
                    </span>
                    {!cat.isActive && (
                      <span className="text-[10px] font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5">Pasif</span>
                    )}
                    {cat.showOnHome && (
                      <span className="text-[10px] font-medium text-green-700 bg-green-50 px-1.5 py-0.5">Anasayfa</span>
                    )}
                  </div>
                  {cat.description && (
                    <p className="mt-0.5 text-[12px] text-[var(--text-muted)] truncate">{cat.description}</p>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] tabular-nums shrink-0">
                  {cat._count?.programs ?? 0} program
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => { setEditId(cat.id); setShowCreate(false); }}
                    className="h-7 px-3 border border-[var(--border)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => { setDeleteId(cat.id); setDeleteError(null); }}
                    className="h-7 px-3 border border-red-200 text-[11px] text-red-600 hover:border-red-400 disabled:opacity-40"
                    disabled={(cat._count?.programs ?? 0) > 0}
                    title={(cat._count?.programs ?? 0) > 0 ? "Bu türe bağlı programlar var" : "Sil"}
                  >
                    Sil
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Silme onayı */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] shadow-xl p-6">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Türü sil</h2>
            <p className="text-[13px] text-[var(--text-secondary)] mb-4">
              Bu tür kalıcı olarak silinecek. Emin misiniz?
            </p>
            {deleteError && <p className="text-xs text-red-600 mb-3">{deleteError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleteLoading}
                className="flex-1 h-9 bg-red-600 text-xs font-medium text-white disabled:opacity-50"
              >
                {deleteLoading ? "Siliniyor..." : "Evet, Sil"}
              </button>
              <button
                onClick={() => { setDeleteId(null); setDeleteError(null); }}
                className="h-9 px-4 border border-[var(--border)] text-xs text-[var(--text-secondary)]"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
