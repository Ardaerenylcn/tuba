"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader, EmptyState, LoadingRows, StatusBadge } from "@/components/admin/ui";

interface Review {
  id: string;
  authorName: string;
  displayName: string | null;
  avatarUrl: string | null;
  rating: number;
  body: string;
  programId: string | null;
  status: string;
  featured: boolean;
  sortOrder: number;
  program?: { title: string } | null;
}
interface ProgramOpt { id: string; title: string }

const STATUS_TONE: Record<string, "green" | "stone" | "amber"> = { published: "green", draft: "amber", archived: "stone" };
const STATUS_LABEL: Record<string, string> = { published: "Yayında", draft: "Taslak", archived: "Arşiv" };

const EMPTY = { authorName: "", displayName: "", avatarUrl: "", rating: 5, body: "", programId: "", status: "published", featured: false, sortOrder: 0 };

function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange?.(n)} disabled={!onChange}
          className={`text-lg leading-none ${n <= value ? "text-amber-500" : "text-stone-300"} ${onChange ? "cursor-pointer" : "cursor-default"}`}>
          ★
        </button>
      ))}
    </div>
  );
}

export default function YorumlarPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [programs, setPrograms] = useState<ProgramOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [r, p] = await Promise.all([
      fetch("/api/v1/admin/reviews").then((x) => x.json()),
      fetch("/api/v1/admin/programs").then((x) => x.json()).catch(() => ({ success: false })),
    ]);
    if (r.success) setReviews(r.data);
    if (p.success) setPrograms(p.data.map((x: { id: string; title: string }) => ({ id: x.id, title: x.title })));
    setLoading(false);
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  function openNew() { setForm(EMPTY); setEditId(null); setShowForm(true); setError(null); }
  function openEdit(r: Review) {
    setForm({ authorName: r.authorName, displayName: r.displayName ?? "", avatarUrl: r.avatarUrl ?? "", rating: r.rating, body: r.body, programId: r.programId ?? "", status: r.status, featured: r.featured, sortOrder: r.sortOrder });
    setEditId(r.id); setShowForm(true); setError(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    const url = editId ? `/api/v1/admin/reviews/${editId}` : "/api/v1/admin/reviews";
    const res = await fetch(url, { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setSaving(false);
    if (!data.success) { setError(data.message ?? "Kaydedilemedi."); return; }
    setShowForm(false); load();
  }

  async function patch(id: string, body: Record<string, unknown>) {
    await fetch(`/api/v1/admin/reviews/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    load();
  }
  async function remove(id: string) {
    if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/v1/admin/reviews/${id}`, { method: "DELETE" });
    load();
  }

  const inputCls = "h-9 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]";
  const labelCls = "text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]";

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Yorumlar" subtitle={`${reviews.length} yorum · anasayfa ve footer'da gösterilir`}
        action={!showForm && <button onClick={openNew} className="h-9 bg-[var(--text-primary)] px-4 text-xs font-medium uppercase tracking-wider text-[var(--surface)]">+ Yeni Yorum</button>} />

      {showForm && (
        <form onSubmit={save} className="flex flex-col gap-4 border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">{editId ? "Yorumu Düzenle" : "Yeni Yorum"}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5"><label className={labelCls}>Kullanıcı adı *</label>
              <input required value={form.authorName} onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))} className={inputCls} placeholder="Arda Yalçın" /></div>
            <div className="flex flex-col gap-1.5"><label className={labelCls}>Gösterim biçimi</label>
              <input value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} className={inputCls} placeholder="Arda Y. (boşsa ad kullanılır)" /></div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5"><label className={labelCls}>Avatar URL (opsiyonel)</label>
              <input value={form.avatarUrl} onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))} className={inputCls} placeholder="https://..." /></div>
            <div className="flex flex-col gap-1.5"><label className={labelCls}>Puan</label><Stars value={form.rating} onChange={(n) => setForm((f) => ({ ...f, rating: n }))} /></div>
          </div>
          <div className="flex flex-col gap-1.5"><label className={labelCls}>Yorum metni *</label>
            <textarea required rows={3} maxLength={2000} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              className="resize-none border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" placeholder="Deneyimini birkaç cümleyle anlat..." /></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5"><label className={labelCls}>Katıldığı workshop</label>
              <select value={form.programId} onChange={(e) => setForm((f) => ({ ...f, programId: e.target.value }))} className={inputCls}>
                <option value="">— Genel —</option>
                {programs.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select></div>
            <div className="flex flex-col gap-1.5"><label className={labelCls}>Durum</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputCls}>
                <option value="published">Yayında</option><option value="draft">Taslak</option><option value="archived">Arşiv</option>
              </select></div>
            <div className="flex flex-col gap-1.5"><label className={labelCls}>Gösterim sırası</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} className={inputCls} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="h-4 w-4" /> Öne çıkar (footer/anasayfa)
          </label>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="h-9 bg-[var(--text-primary)] px-5 text-xs font-medium uppercase tracking-wider text-[var(--surface)] disabled:opacity-50">{saving ? "Kaydediliyor..." : editId ? "Kaydet" : "Oluştur"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="h-9 border border-[var(--border)] px-4 text-xs text-[var(--text-secondary)]">İptal</button>
          </div>
        </form>
      )}

      {loading ? <LoadingRows /> : reviews.length === 0 ? (
        <EmptyState title="Henüz yorum yok." description="İlk yorumu ekleyin; anasayfa ve footer'da gösterilir." icon="★"
          action={<button onClick={openNew} className="text-xs font-medium text-[var(--accent)] hover:underline">İlk yorumu ekle →</button>} />
      ) : (
        <div className="flex flex-col gap-2">
          {reviews.map((r) => (
            <div key={r.id} className="flex flex-col gap-2 border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{r.displayName || r.authorName}</span>
                  <Stars value={r.rating} />
                  <StatusBadge label={STATUS_LABEL[r.status] ?? r.status} tone={STATUS_TONE[r.status] ?? "stone"} />
                  {r.featured && <StatusBadge label="Öne çıkan" tone="blue" />}
                  {r.program && <span className="text-[11px] text-[var(--text-muted)]">· {r.program.title}</span>}
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{r.body}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <button onClick={() => patch(r.id, { status: r.status === "published" ? "draft" : "published" })} className="text-[11px] text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text-primary)]">{r.status === "published" ? "Taslağa al" : "Yayınla"}</button>
                <button onClick={() => patch(r.id, { featured: !r.featured })} className="text-[11px] text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text-primary)]">{r.featured ? "Öne çıkarma" : "Öne çıkar"}</button>
                <button onClick={() => openEdit(r)} className="text-[11px] text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text-primary)]">Düzenle</button>
                <button onClick={() => remove(r.id)} className="text-[11px] text-red-600 underline underline-offset-2 hover:text-red-700">Sil</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
