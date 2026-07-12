"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader, EmptyState, LoadingRows, StatusBadge, type BadgeTone } from "@/components/admin/ui";

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  status: string;
  featured: boolean;
  publishedAt: string | null;
  createdAt: string;
}

function statusInfo(p: Post): { label: string; tone: BadgeTone } {
  if (p.status === "draft") return { label: "Taslak", tone: "amber" };
  if (p.status === "archived") return { label: "Arşiv", tone: "stone" };
  if (p.status === "published" && p.publishedAt && new Date(p.publishedAt) > new Date()) return { label: "Zamanlandı", tone: "blue" };
  return { label: "Yayında", tone: "green" };
}

export default function BlogListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/admin/blog");
    const data = await res.json();
    if (data.success) setPosts(data.data);
    setLoading(false);
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  async function remove(id: string) {
    if (!confirm("Bu yazıyı silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/v1/admin/blog/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Blog" subtitle={`${posts.length} yazı`}
        action={<Link href="/admin/blog/yeni" className="inline-flex h-9 items-center bg-[var(--text-primary)] px-4 text-xs font-medium uppercase tracking-wider text-[var(--surface)]">+ Yeni Yazı</Link>} />

      {loading ? <LoadingRows /> : posts.length === 0 ? (
        <EmptyState title="Henüz blog yazısı yok." icon="✎"
          action={<Link href="/admin/blog/yeni" className="text-xs font-medium text-[var(--accent)] hover:underline">İlk yazıyı oluştur →</Link>} />
      ) : (
        <div className="flex flex-col divide-y divide-[var(--border)] border border-[var(--border)] bg-[var(--surface)]">
          {posts.map((p) => {
            const s = statusInfo(p);
            return (
              <div key={p.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{p.title}</span>
                    <StatusBadge label={s.label} tone={s.tone} />
                    {p.featured && <StatusBadge label="Öne çıkan" tone="blue" />}
                    {p.category && <span className="text-[11px] text-[var(--text-muted)]">· {p.category}</span>}
                  </div>
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">/blog/{p.slug}</span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Link href={`/blog/${p.slug}`} target="_blank" className="text-[11px] text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text-primary)]">Önizle</Link>
                  <Link href={`/admin/blog/${p.id}`} className="text-[11px] text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text-primary)]">Düzenle</Link>
                  <button onClick={() => remove(p.id)} className="text-[11px] text-red-600 underline underline-offset-2 hover:text-red-700">Sil</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
