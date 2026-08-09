import Link from "next/link";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { ProgramReorderList, type ReorderProgram } from "@/components/admin/program-reorder-list";

export const metadata: Metadata = { title: "Programlar | Admin" };

async function getPrograms() {
  return db.program.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
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

      {Object.entries(typeGroups).map(([type, items]) => {
        const serialized: ReorderProgram[] = items.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          type: p.type,
          status: p.status,
          basePrice: Number(p.basePrice),
          sessionCount: p._count.sessions,
        }));
        return (
          <section key={type} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-[var(--text-primary)] capitalize">{type}</h2>
              <span className="text-xs text-[var(--text-muted)]">{items.length} program · sürükleyerek sıralayın</span>
            </div>
            <ProgramReorderList programs={serialized} />
          </section>
        );
      })}

      {programs.length === 0 && (
        <div className="flex min-h-[200px] items-center justify-center border border-dashed border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)]">Henüz program eklenmedi.</p>
        </div>
      )}
    </div>
  );
}
