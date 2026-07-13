"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import { RichTextEditor } from "./rich-text-editor";
import { CoverImagePicker } from "./cover-image-picker";

export interface BlogInitial {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: unknown;
  coverImageId?: string | null;
  coverImageUrl?: string | null;
  authorName?: string;
  category?: string | null;
  tags?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  status?: string;
  featured?: boolean;
  publishedAt?: string | null;
}

function slugify(str: string) {
  return str.toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// datetime-local için ISO → "YYYY-MM-DDTHH:mm"
function toLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

const inputCls = "h-9 w-full border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]";
const labelCls = "text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]";

export function BlogForm({ initial }: { initial?: BlogInitial }) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    coverImageId: initial?.coverImageId ?? null as string | null,
    coverImageUrl: initial?.coverImageUrl ?? null as string | null,
    authorName: initial?.authorName ?? "Tuba Atman",
    category: initial?.category ?? "",
    tags: (initial?.tags ?? []).join(", "),
    seoTitle: initial?.seoTitle ?? "",
    seoDescription: initial?.seoDescription ?? "",
    status: initial?.status ?? "draft",
    featured: initial?.featured ?? false,
    publishedAt: toLocalInput(initial?.publishedAt),
  });
  const [content, setContent] = useState<JSONContent>(() => {
    const raw = initial?.content;
    if (!raw) return { type: "doc", content: [] };
    if (typeof raw === "string") { try { return JSON.parse(raw); } catch { return { type: "doc", content: [] }; } }
    return raw as JSONContent;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setTitle(title: string) {
    setForm((f) => ({ ...f, title, slug: f.slug === slugify(f.title) || f.slug === "" ? slugify(title) : f.slug }));
  }

  // Kaydetme işlemi bir "status" ile tetiklenir: butonlar hangi durumu istediğini açıkça belirtir.
  // Böylece "yayın tarihi girildi ama durum taslak kaldı" karışıklığı ortadan kalkar.
  async function save(targetStatus: string) {
    if (!form.title.trim() || !form.slug.trim()) {
      setError("Başlık ve slug zorunludur.");
      return;
    }
    setSaving(true); setError(null);
    // Yayınlanıyorsa ve tarih girilmemişse şimdi yayınla (backend de bunu garanti eder).
    const publishedAt = form.publishedAt
      ? new Date(form.publishedAt).toISOString()
      : targetStatus === "published"
        ? new Date().toISOString()
        : null;
    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      content,
      coverImageId: form.coverImageId,
      authorName: form.authorName,
      category: form.category || null,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
      status: targetStatus,
      featured: form.featured,
      publishedAt,
    };
    setForm((f) => ({ ...f, status: targetStatus }));
    const url = isEdit ? `/api/v1/admin/blog/${initial!.id}` : "/api/v1/admin/blog";
    const res = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (!data.success) { setError(data.message ?? "Kaydedilemedi."); return; }
    router.push("/admin/blog");
    router.refresh();
  }

  const statusLabel = form.status === "published" ? "Yayında" : form.status === "archived" ? "Arşivlendi" : "Taslak";
  const statusTone = form.status === "published"
    ? "bg-green-100 text-green-700"
    : form.status === "archived"
      ? "bg-neutral-200 text-neutral-600"
      : "bg-amber-100 text-amber-700";

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
      {error && <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Sol: içerik */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Başlık *</label>
            <input required value={form.title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Yazı başlığı" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Slug *</label>
            <input required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className={`${inputCls} font-mono`} placeholder="yazi-basligi" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Kısa açıklama (özet)</label>
            <textarea rows={2} maxLength={500} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              className="resize-none border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" placeholder="Liste ve önizlemede görünecek kısa açıklama" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>İçerik</label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>
        </div>

        {/* Sağ: yayın ayarları */}
        <div className="flex flex-col gap-4">
          <div className="border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-4">
            <CoverImagePicker
              value={form.coverImageId}
              previewUrl={form.coverImageUrl}
              onChange={(id, url) => setForm((f) => ({ ...f, coverImageId: id, coverImageUrl: url }))}
              onClear={() => setForm((f) => ({ ...f, coverImageId: null, coverImageUrl: null }))}
              aspect={16 / 9}
              label="Kapak Görseli"
              hint="Seçince kırpma ekranı açılır (16:9 — yatay)"
            />
          </div>

          <div className="border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className={labelCls}>Durum</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusTone}`}>{statusLabel}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Yayın tarihi (zamanlama)</label>
              <input type="datetime-local" value={form.publishedAt} onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))} className={inputCls} />
              <span className="text-[10px] text-[var(--text-muted)]">Boş bırakılırsa &quot;Yayınla&quot; ile şimdi yayınlanır. Gelecek tarih girilirse o tarihe kadar görünmez.</span>
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="h-4 w-4" /> Öne çıkar
            </label>
          </div>

          <div className="border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5"><label className={labelCls}>Yazar</label>
              <input value={form.authorName} onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))} className={inputCls} /></div>
            <div className="flex flex-col gap-1.5"><label className={labelCls}>Kategori</label>
              <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={inputCls} placeholder="ör. İpuçları" /></div>
            <div className="flex flex-col gap-1.5"><label className={labelCls}>Etiketler (virgülle)</label>
              <input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} className={inputCls} placeholder="takı, gümüş, atölye" /></div>
          </div>

          <div className="border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-3">
            <p className={labelCls}>SEO</p>
            <input value={form.seoTitle} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} className={inputCls} placeholder="Meta başlık (boşsa başlık)" />
            <textarea rows={2} maxLength={500} value={form.seoDescription} onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
              className="resize-none border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" placeholder="Meta açıklama (boşsa özet)" />
          </div>

          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => save("published")} disabled={saving}
              className="h-10 bg-[var(--text-primary)] text-xs font-medium uppercase tracking-wider text-[var(--surface)] disabled:opacity-50">
              {saving ? "Kaydediliyor..." : form.status === "published" ? "Güncelle" : "Yayınla"}
            </button>
            <button type="button" onClick={() => save("draft")} disabled={saving}
              className="h-10 border border-[var(--border)] text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] disabled:opacity-50">
              Taslak olarak kaydet
            </button>
            {isEdit && form.status !== "archived" && (
              <button type="button" onClick={() => save("archived")} disabled={saving}
                className="h-9 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] transition-colors hover:text-red-600 disabled:opacity-50">
                Arşivle
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
