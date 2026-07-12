"use client";

import Link from "next/link";
import { useState } from "react";

export interface ReorderProgram {
  id: string;
  title: string;
  slug: string;
  status: string;
  basePrice: number;
  sessionCount: number;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Taslak",
  published: "Yayında",
  archived: "Arşiv",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-stone-100 text-stone-600",
  published: "bg-green-50 text-green-700",
  archived: "bg-stone-100 text-stone-400",
};

export function ProgramReorderList({
  programs: initial,
}: {
  programs: ReorderProgram[];
}) {
  const [programs, setPrograms] = useState(initial);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function persist(ordered: ReorderProgram[]) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/admin/programs/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: ordered.map((p) => p.id) }),
      });
      const data = await res.json();
      if (!data.success) setError(data.message ?? "Sıralama kaydedilemedi.");
    } catch {
      setError("Sıralama kaydedilemedi.");
    }
    setSaving(false);
  }

  function handleDrop(dropIndex: number) {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = [...programs];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(dropIndex, 0, moved);
    setPrograms(next);
    setDragIndex(null);
    setOverIndex(null);
    persist(next);
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)]">
        {programs.map((p, i) => (
          <div
            key={p.id}
            draggable
            onDragStart={(e) => {
              setDragIndex(i);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (overIndex !== i) setOverIndex(i);
            }}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(i);
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            className={`flex items-center gap-3 px-4 py-3 transition-colors ${
              dragIndex === i ? "opacity-40" : ""
            } ${overIndex === i && dragIndex !== i ? "bg-[var(--bg-subtle)] ring-1 ring-inset ring-[var(--text-primary)]/20" : "hover:bg-[var(--bg-subtle)]"}`}
          >
            {/* Sürükleme tutamağı */}
            <span
              className="cursor-grab active:cursor-grabbing text-[var(--text-muted)] select-none shrink-0"
              title="Sürükleyerek sırala"
              aria-hidden
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <circle cx="7" cy="5" r="1.4" />
                <circle cx="13" cy="5" r="1.4" />
                <circle cx="7" cy="10" r="1.4" />
                <circle cx="13" cy="10" r="1.4" />
                <circle cx="7" cy="15" r="1.4" />
                <circle cx="13" cy="15" r="1.4" />
              </svg>
            </span>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-[var(--text-primary)] truncate">{p.title}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">/{p.slug}</p>
            </div>

            <span className="text-xs text-[var(--text-secondary)] tabular-nums shrink-0 hidden sm:inline">
              {p.sessionCount} oturum
            </span>
            <span className="text-xs text-[var(--text-secondary)] tabular-nums shrink-0 hidden sm:inline">
              {p.basePrice.toLocaleString("tr-TR")} ₺
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 text-xs shrink-0 ${STATUS_COLORS[p.status]}`}>
              {STATUS_LABELS[p.status] ?? p.status}
            </span>
            <Link
              href={`/admin/programlar/${p.id}`}
              className="text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)] shrink-0"
            >
              Düzenle
            </Link>
          </div>
        ))}
      </div>
      {saving && <p className="text-[11px] text-[var(--text-muted)]">Sıralama kaydediliyor…</p>}
    </div>
  );
}
