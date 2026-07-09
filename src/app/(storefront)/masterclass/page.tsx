import { db } from "@/lib/db";
import { ProgramCard } from "@/components/storefront/program-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masterclass | Atölye Biz",
  description: "Deneyimli ustaların yönetiminde ileri seviye masterclass programları.",
};

async function getMasterclasses() {
  return db.program.findMany({
    where: { type: "masterclass", status: "published" },
    orderBy: { createdAt: "desc" },
    include: { coverImage: { select: { url: true } } },
  });
}

export default async function MasterclassPage() {
  const programs = await getMasterclasses();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-16 max-w-xl">
        <p className="mb-4 text-xs font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">
          Masterclass
        </p>
        <h1 className="mb-4 text-4xl font-light tracking-tight text-[var(--text-primary)] sm:text-5xl">
          Ustadan öğrenin.
        </h1>
        <p className="text-base leading-relaxed text-[var(--text-secondary)]">
          Alanında uzman eğitmenlerle ileri seviye teknikler, özel içerikler ve kişisel mentorluk.
        </p>
      </div>

      {programs.length > 0 ? (
        <div className="grid grid-cols-1 gap-px bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 border border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)]">Henüz yayınlanmış masterclass bulunmuyor.</p>
          <p className="text-xs text-[var(--text-disabled)]">Yakında yeni programlar eklenecek.</p>
        </div>
      )}
    </div>
  );
}
