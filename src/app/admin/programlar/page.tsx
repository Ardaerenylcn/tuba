import Link from "next/link";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Programlar | Admin" };

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

function ProgramTable({ programs }: { programs: Awaited<ReturnType<typeof getPrograms>> }) {
  if (programs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 border border-[var(--border)] bg-[var(--surface)]">
        <p className="text-sm text-[var(--text-muted)]">Henüz program yok.</p>
        <Link href="/admin/programlar/yeni" className="text-xs underline underline-offset-4 text-[var(--text-secondary)]">
          İlk programı oluştur
        </Link>
      </div>
    );
  }

  return (
    <div className="border border-[var(--border)] bg-[var(--surface)] overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {["Program", "Oturum", "Fiyat", "Durum", ""].map((h) => (
              <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[var(--text-muted)]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {programs.map((p) => (
            <tr key={p.id} className="hover:bg-[var(--bg-subtle)]">
              <td className="px-5 py-3">
                <p className="font-medium text-[var(--text-primary)]">{p.title}</p>
                <p className="text-xs text-[var(--text-muted)]">/{p.slug}</p>
              </td>
              <td className="px-5 py-3 text-[var(--text-secondary)]">{p._count.sessions}</td>
              <td className="px-5 py-3 text-[var(--text-secondary)]">
                {Number(p.basePrice).toLocaleString("tr-TR")} ₺
              </td>
              <td className="px-5 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 text-xs ${STATUS_COLORS[p.status]}`}>
                  {STATUS_LABELS[p.status]}
                </span>
              </td>
              <td className="px-5 py-3">
                <Link
                  href={`/admin/programlar/${p.id}`}
                  className="text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)]"
                >
                  Düzenle
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function getPrograms() {
  return db.program.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { sessions: true } } },
  });
}

export default async function AdminProgramsPage() {
  const programs = await getPrograms();
  // Tüm tipleri dinamik olarak grupla
  const typeGroups = programs.reduce<Record<string, typeof programs>>((acc, p) => {
    if (!acc[p.type]) acc[p.type] = [];
    acc[p.type].push(p);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-[var(--text-primary)]">Programlar</h1>
          <p className="text-sm text-[var(--text-muted)]">{programs.length} program</p>
        </div>
        <Link
          href="/admin/programlar/yeni"
          className="inline-flex h-9 items-center justify-center bg-[var(--text-primary)] px-5 text-xs font-medium tracking-[0.1em] uppercase text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)]"
        >
          + Yeni Program
        </Link>
      </div>

      {Object.entries(typeGroups).map(([type, items]) => (
        <section key={type} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--text-primary)] capitalize">{type}</h2>
            <span className="text-xs text-[var(--text-muted)]">{items.length} program</span>
          </div>
          <ProgramTable programs={items} />
        </section>
      ))}

      {programs.length === 0 && (
        <div className="flex min-h-[200px] items-center justify-center border border-dashed border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)]">Henüz program eklenmedi.</p>
        </div>
      )}
    </div>
  );
}
