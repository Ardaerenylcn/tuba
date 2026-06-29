"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  sessionCount: number;
}

export function DeleteProgramButton({ id, sessionCount }: Props) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/v1/admin/programs/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) {
      setError(data.message ?? "Silinemedi.");
      setLoading(false);
      setConfirm(false);
      return;
    }
    router.push("/admin/programlar");
    router.refresh();
  }

  if (sessionCount > 0) return null;

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <span className="text-xs text-[var(--text-muted)]">Emin misin?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="h-8 px-3 text-xs text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50"
        >
          {loading ? "Siliniyor..." : "Evet, Sil"}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="h-8 px-3 text-xs text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-subtle)]"
        >
          İptal
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="h-8 px-3 text-xs text-red-600 hover:underline"
    >
      Sil
    </button>
  );
}
