"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface MediaItem {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number | null;
  createdAt: Date;
}

export function MediaGrid({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`"${name}" silinsin mi? Bu işlem geri alınamaz.`)) return;
    setDeleting(id);
    const res = await fetch(`/api/v1/admin/media/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (res.ok) router.refresh();
  }

  function handleCopy(url: string, id: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 border border-[var(--border)]">
        <p className="text-sm text-[var(--text-muted)]">Henüz görsel yüklenmemiş.</p>
        <p className="text-xs text-[var(--text-disabled)]">Program kapak görselleri ve galeri görselleri burada görünür.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-px bg-[var(--border)] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <div key={item.id} className="group relative bg-[var(--surface)]">
          <div className="aspect-square overflow-hidden bg-[var(--bg-subtle)]">
            <img src={item.url} alt={item.fileName} className="h-full w-full object-cover" loading="lazy" />
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
            <button
              onClick={() => handleCopy(item.url, item.id)}
              className="rounded bg-white/90 px-3 py-1 text-xs font-medium text-stone-900 hover:bg-white"
            >
              {copied === item.id ? "Kopyalandı!" : "URL Kopyala"}
            </button>
            <button
              onClick={() => handleDelete(item.id, item.fileName)}
              disabled={deleting === item.id}
              className="rounded bg-red-500/90 px-3 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
            >
              {deleting === item.id ? "Siliniyor…" : "Sil"}
            </button>
          </div>

          {/* Meta */}
          <div className="border-t border-[var(--border)] px-2 py-1.5">
            <p className="truncate text-[10px] text-[var(--text-muted)]" title={item.fileName}>
              {item.fileName}
            </p>
            {item.sizeBytes && (
              <p className="text-[10px] text-[var(--text-disabled)]">
                {item.sizeBytes < 1024 * 1024
                  ? `${Math.round(item.sizeBytes / 1024)} KB`
                  : `${(item.sizeBytes / 1024 / 1024).toFixed(1)} MB`}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
