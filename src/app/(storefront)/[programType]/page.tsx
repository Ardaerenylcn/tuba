import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProgramCard } from "@/components/storefront/program-card";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ programType: string }>;
}

const TYPE_NAME_MAP: Record<string, string> = {
  atolyeler: "Atölyeler",
  sertifikalar: "Sertifikalar",
  masterclass: "Masterclass",
};

function deriveLabel(slug: string): string {
  return TYPE_NAME_MAP[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
}

async function getPageData(programType: string) {
  const [cat, programs] = await Promise.all([
    db.programCategory.findUnique({ where: { slug: programType } }),
    db.program.findMany({
      where: { type: programType, status: "published" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { coverImage: { select: { url: true } } },
    }),
  ]);
  return { cat, programs };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { programType } = await params;
  const { cat, programs } = await getPageData(programType);
  const name = cat?.name ?? deriveLabel(programType);
  if (!cat && programs.length === 0) return {};
  return {
    title: `${name} | Atölye Biz`,
    description: cat?.description ?? undefined,
  };
}

export default async function DynamicProgramTypePage({ params }: Props) {
  const { programType } = await params;
  const { cat, programs } = await getPageData(programType);

  // Hem kategori kaydı yok hem de yayında program yok → 404
  if (!cat && programs.length === 0) notFound();

  const name = cat?.name ?? deriveLabel(programType);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-16 max-w-xl">
        <p className="mb-4 text-xs font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">
          {name}
        </p>
        <h1 className="mb-4 text-4xl font-light tracking-tight text-[var(--text-primary)] sm:text-5xl">
          {name}
        </h1>
        {cat?.description && (
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
