"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  status: string;
}

export function ReservationActions({ id, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(newStatus: string) {
    setLoading(newStatus);
    setError(null);
    const res = await fetch(`/api/v1/admin/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    setLoading(null);
    if (!data.success) { setError(data.message ?? "Hata"); return; }
    router.refresh();
  }

  if (status === "pending") {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => act("confirmed")}
            disabled={!!loading}
            className="text-xs font-medium text-green-700 underline underline-offset-4 hover:text-green-900 disabled:opacity-50"
          >
            {loading === "confirmed" ? "..." : "Onayla"}
          </button>
          <span className="text-[var(--border-strong)]">·</span>
          <button
            onClick={() => act("cancelled")}
            disabled={!!loading}
            className="text-xs text-red-500 underline underline-offset-4 hover:text-red-700 disabled:opacity-50"
          >
            {loading === "cancelled" ? "..." : "İptal"}
          </button>
        </div>
        {error && <p className="text-[10px] text-red-500">{error}</p>}
      </div>
    );
  }

  if (status === "confirmed") {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => act("completed")}
            disabled={!!loading}
            className="text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)] disabled:opacity-50"
          >
            {loading === "completed" ? "..." : "Tamamlandı"}
          </button>
          <span className="text-[var(--border-strong)]">·</span>
          <button
            onClick={() => act("no_show")}
            disabled={!!loading}
            className="text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)] disabled:opacity-50"
          >
            {loading === "no_show" ? "..." : "Gelmedi"}
          </button>
          <span className="text-[var(--border-strong)]">·</span>
          <button
            onClick={() => act("cancelled")}
            disabled={!!loading}
            className="text-xs text-red-500 underline underline-offset-4 hover:text-red-700 disabled:opacity-50"
          >
            {loading === "cancelled" ? "..." : "İptal"}
          </button>
        </div>
        {error && <p className="text-[10px] text-red-500">{error}</p>}
      </div>
    );
  }

  return null;
}
