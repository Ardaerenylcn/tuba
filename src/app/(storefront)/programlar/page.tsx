import { db } from "@/lib/db";
import { ProgramCard } from "@/components/storefront/program-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tüm Programlar | Atölye Biz",
  description: "Atölyeler, sertifikalar ve tüm program türleri.",
};

const TYPE_NAME_MAP: Record<string, string> = {
  atolyeler: "Atölyeler",
  sertifikalar: "Sertifikalar",
  masterclass: "Masterclass",
};

function deriveLabel(slug: string): string {
  return TYPE_NAME_MAP[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
}

async function getAllPrograms() {
  const [programs, categories] = await Promise.all([
    db.program.findMany({
      where: { status: "published" },
      orderBy: { createdAt: "desc" },
      include: { coverImage: { select: { url: true } } },
    }),
    db.programCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);
  return { programs, categories };
}

export default async function AllProgramsPage() {
  const { programs, categories } = await getAllPrograms();

  const catNameBySlug = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const catOrder = categories.map((c) => c.slug);

  const allTypes = [...new Set(programs.map((p) => p.type))];
  const orderedTypes = [
    ...catOrder.filter((s) => allTypes.includes(s)),
    ...allTypes.filter((s) => !catOrder.includes(s)),
  ];

  const typeGroups = orderedTypes.map((type) => ({
    slug: type,
    name: catNameBySlug[type] ?? deriveLabel(type),
    programs: programs.filter((p) => p.type === type),
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* Sayfa başlığı */}
      <div className="mb-16 max-w-xl">
        <p className="mb-4 text-xs font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">
          Atölye Biz
        </p>
        <h1 className="mb-4 text-4xl font-light tracking-tight text-[var(--text-primary)] sm:text-5xl">
          Tüm Programlar
        </h1>
        <p className="text-base leading-relaxed text-[var(--text-secondary)]">
          Takı tasarımını keşfetmek, üretim süreçlerini öğrenmek ve kendi parçanı yaratmak için programlarımıza katılabilirsin.
        </p>
      </div>

      {typeGroups.length > 0 ? (
        <div className="flex flex-col gap-20">
          {typeGroups.map((group) => (
            <section key={group.slug}>
              {/* Tip başlığı */}
              <div className="mb-8 border-b border-[var(--border)] pb-3">
                <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-[var(--text-primary)]">
                  {group.name}
                </p>
              </div>
              {/* Program ızgarası */}
              <div className="grid grid-cols-1 gap-px bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
                {group.programs.map((program) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            </section>
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
