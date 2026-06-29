import { db } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "İçerik | Admin" };

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

export default async function AdminContentPage() {
  const entries = await db.siteContent.findMany({
    orderBy: [{ key: "asc" }, { locale: "asc" }],
    include: { editor: { select: { name: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-medium text-[var(--text-primary)]">Site İçeriği</h1>
        <p className="text-sm text-[var(--text-muted)]">{entries.length} içerik girişi</p>
      </div>

      <div className="border border-[var(--border)] bg-[var(--surface)]">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <p className="text-sm text-[var(--text-muted)]">Henüz içerik yok.</p>
            <p className="text-xs text-[var(--text-disabled)]">
              İçerik girişleri galeri ve ayarlar gibi sayfalar kaydedildikçe burada görünür.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {["Anahtar", "Dil", "Değer Önizleme", "Durum", "Son Güncelleyen", "Tarih"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {entries.map((entry) => {
                  const preview = JSON.stringify(entry.value).slice(0, 80);
                  return (
                    <tr key={entry.id} className="hover:bg-[var(--bg-subtle)]">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-[var(--text-primary)]">{entry.key}</span>
                      </td>
                      <td className="px-4 py-3 text-xs uppercase text-[var(--text-muted)]">{entry.locale}</td>
                      <td className="max-w-xs px-4 py-3">
                        <p className="truncate font-mono text-[10px] text-[var(--text-disabled)]" title={JSON.stringify(entry.value)}>
                          {preview}{preview.length === 80 ? "…" : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs ${STATUS_COLORS[entry.status] ?? ""}`}>
                          {STATUS_LABELS[entry.status] ?? entry.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                        {entry.editor?.name ?? <span className="text-[var(--text-disabled)]">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                        {new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Istanbul" }).format(new Date(entry.updatedAt))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
