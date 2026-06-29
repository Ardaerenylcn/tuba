"use client";

import { useEffect, useState, useCallback } from "react";

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

const EMPTY = { question: "", answer: "", sortOrder: 0 };

export function FaqsPanel({ programId }: { programId: string }) {
  const [faqs, setFaqs] = useState<FaqRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const base = `/api/v1/admin/programs/${programId}/faqs`;

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(base);
    const data = await res.json();
    if (data.success) setFaqs(data.data);
    setLoading(false);
  }, [base]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.question.trim() || !addForm.answer.trim()) {
      setAddError("Soru ve cevap zorunludur.");
      return;
    }
    setAddLoading(true);
    setAddError(null);
    const res = await fetch(base, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: addForm.question.trim(),
        answer: addForm.answer.trim(),
        sortOrder: faqs.length,
      }),
    });
    const data = await res.json();
    setAddLoading(false);
    if (!data.success) { setAddError(data.message ?? "Hata oluştu."); return; }
    setAdding(false);
    setAddForm(EMPTY);
    load();
  }

  function startEdit(faq: FaqRow) {
    setEditingId(faq.id);
    setEditForm({ question: faq.question, answer: faq.answer, sortOrder: faq.sortOrder });
    setEditError(null);
  }

  async function handleEdit(e: React.FormEvent, id: string) {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    const res = await fetch(`${base}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: editForm.question.trim(),
        answer: editForm.answer.trim(),
        sortOrder: editForm.sortOrder,
      }),
    });
    const data = await res.json();
    setEditLoading(false);
    if (!data.success) { setEditError(data.message ?? "Hata oluştu."); return; }
    setEditingId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu SSS maddesini silmek istiyor musunuz?")) return;
    const res = await fetch(`${base}/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) { alert(data.message ?? "Silinemedi."); return; }
    load();
  }

  return (
    <div className="flex flex-col gap-4 border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-[var(--text-primary)]">Sık Sorulan Sorular</h2>
          <p className="text-xs text-[var(--text-muted)]">{faqs.length} madde</p>
        </div>
        <button
          type="button"
          onClick={() => { setAdding((p) => !p); setAddError(null); }}
          className={`inline-flex h-8 items-center px-4 text-xs font-medium tracking-[0.08em] uppercase transition-colors ${
            adding
              ? "bg-[var(--color-stone-700)] text-[var(--surface)]"
              : "bg-[var(--text-primary)] text-[var(--surface)] hover:bg-[var(--color-stone-700)]"
          }`}
        >
          {adding ? "İptal" : "+ Soru Ekle"}
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="flex flex-col gap-3 border border-dashed border-[var(--border)] p-4">
          <p className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Yeni Soru</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Soru *</label>
            <input
              type="text"
              value={addForm.question}
              onChange={(e) => setAddForm({ ...addForm, question: e.target.value })}
              placeholder="Sık sorulan soru..."
              className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Cevap *</label>
            <textarea
              value={addForm.answer}
              onChange={(e) => setAddForm({ ...addForm, answer: e.target.value })}
              placeholder="Cevap metni..."
              rows={3}
              className="resize-y border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            />
          </div>
          {addError && <p className="text-xs text-red-600">{addError}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={addLoading}
              className="h-9 bg-[var(--text-primary)] px-6 text-xs font-medium tracking-[0.08em] uppercase text-[var(--surface)] hover:bg-[var(--color-stone-700)] disabled:opacity-50"
            >
              {addLoading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-6 text-center text-xs text-[var(--text-muted)]">Yükleniyor...</p>
      ) : faqs.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--text-muted)]">
          Henüz soru yok. Yukarıdan ekleyin.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-[var(--border)] border border-[var(--border)]">
          {faqs.map((faq) =>
            editingId === faq.id ? (
              <form
                key={faq.id}
                onSubmit={(e) => handleEdit(e, faq.id)}
                className="flex flex-col gap-3 bg-[var(--bg-subtle)] p-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Soru</label>
                  <input
                    type="text"
                    value={editForm.question}
                    onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                    className="h-9 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Cevap</label>
                  <textarea
                    value={editForm.answer}
                    onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                    rows={3}
                    className="resize-y border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
                  />
                </div>
                {editError && <p className="text-xs text-red-600">{editError}</p>}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="h-8 bg-[var(--text-primary)] px-5 text-xs font-medium tracking-[0.08em] uppercase text-[var(--surface)] disabled:opacity-50"
                  >
                    {editLoading ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </div>
              </form>
            ) : (
              <div key={faq.id} className="flex items-start gap-4 px-4 py-3 hover:bg-[var(--bg-subtle)]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{faq.question}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)] line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => startEdit(faq)}
                    className="text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)]"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(faq.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Sil
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
