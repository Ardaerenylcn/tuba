import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProgramCard } from "@/components/storefront/program-card";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ programType: string }>;
}

// Bu route sadece özel sayfası olmayan yeni tipler için çalışır.
// /atolyeler, /sertifikalar, /masterclass kendi sayfalarına sahip,
// onlar öncelikli olarak açılır.

async function getCategory(slug: string) {
  return db.programCategory.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { programType } = await params;
  const cat = await getCategory(programType);
  if (!cat) return {};
  return {
    title: `${cat.name} | Atölye Biz`,
    description: cat.description ?? undefined,
  };
}

export default async function DynamicProgramTypePage({ params }: Props) {
  const { programType } = await params;
  const cat = await getCategory(programType);
  if (!cat) notFound();

  const programs = await db.program.findMany({
    where: { type: programType, status: "published" },
    orderBy: { createdAt: "desc" },
    include: { coverImage: { select: { url: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-16 max-w-xl">
        <p className="mb-4 text-xs font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">
          {cat.name}
        </p>
        <h1 className="mb-4 text-4xl font-light tracking-tight text-[var(--text-primary)] sm:text-5xl">
          {cat.name}
        </h1>
        {cat.description && (
          <p className="text-base leading-relaxed text-[var(--text-secondary)]">{cat.description}</p>
        )}
      </div>

      {programs.length > 0 ? (
        <div className="grid grid-cols-1 gap-px bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 border border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)]">Henüz yayınlanmış program bulunmuyor.</p>
          <p className="text-xs text-[var(--text-disabled)]">Yakında yeni programlar eklenecek.</p>
        </div>
      )}
    </div>
  );
}
