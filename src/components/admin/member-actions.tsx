"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { membershipStatus } from "@/lib/membership";

export function MemberActions({
  userId,
  initialActive,
  initialNotes,
  emailVerified,
}: {
  userId: string;
  initialActive: boolean;
  initialNotes: string | null;
  emailVerified: boolean;
}) {
  const router = useRouter();
  const [active, setActive] = useState(initialActive);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [savedNotes, setSavedNotes] = useState(initialNotes ?? "");
  const [busy, setBusy] = useState<null | "status" | "notes">(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const status = membershipStatus(active, emailVerified);

  async function patch(data: Record<string, unknown>) {
    const res = await fetch(`/api/v1/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async function toggleActive() {
    setBusy("status");
    setError(null);
    setMsg(null);
    const data = await patch({ isActive: !active });
    setBusy(null);
    if (!data.success) { setError(data.message ?? "Güncellenemedi."); return; }
    setActive(!active);
    router.refresh();
  }

  async function saveNotes() {
    setBusy("notes");
    setError(null);
    setMsg(null);
    const data = await patch({ adminNotes: notes });
    setBusy(null);
    if (!data.success) { setError(data.message ?? "Kaydedilemedi."); return; }
    setSavedNotes(notes);
    setMsg("Not kaydedildi.");
  }

  return (
    <div className="flex flex-col gap-4 border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Üyelik Durumu</p>
          <span className={`inline-flex items-center px-2 py-0.5 text-xs ${status.tone}`}>{status.label}</span>
        </div>
        <button
          onClick={toggleActive}
          disabled={busy === "status"}
          className={`h-8 px-4 text-xs font-medium uppercase tracking-wider transition-colors disabled:opacity-50 ${
            active
              ? "border border-red-200 text-red-600 hover:border-red-400"
              : "bg-[var(--text-primary)] text-[var(--surface)] hover:bg-[var(--color-stone-700)]"
          }`}
        >
          {busy === "status" ? "..." : active ? "Pasif Yap / Engelle" : "Aktif Yap"}
        </button>
      </div>

      <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-4">
        <label className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">Yönetim Notu</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setMsg(null); }}
          maxLength={2000}
          placeholder="Sadece yöneticilerin göreceği not..."
          className="resize-none border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={saveNotes}
            disabled={busy === "notes" || notes === savedNotes}
            className="h-8 bg-[var(--text-primary)] px-4 text-xs font-medium uppercase tracking-wider text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)] disabled:opacity-40"
          >
            {busy === "notes" ? "Kaydediliyor..." : "Notu Kaydet"}
          </button>
          {msg && <span className="text-xs text-green-700">{msg}</span>}
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </div>
    </div>
  );
}
