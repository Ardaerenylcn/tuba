import { db } from "@/lib/db";
import { ProgramCard } from "@/components/storefront/program-card";
import Link from "next/link";
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
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);
  return { programs, categories };
}

export default async function AllProgramsPage() {
  const { programs, categories } = await getAllPrograms();

  // Pasif kategoriler gösterilmez
  const blocked = new Set(categories.filter((c) => !c.isActive).map((c) => c.slug));
  const activeCats = categories.filter((c) => c.isActive);

  const catNameBySlug = Object.fromEntries(activeCats.map((c) => [c.slug, c.name]));
  const catOrder = activeCats.map((c) => c.slug);

  // Yayında programı olan tipler — pasif kategoriler hariç
  const publishedTypes = [...new Set(programs.map((p) => p.type))].filter((s) => !blocked.has(s));

  // showOnHome açık kategoriler (programsız olsa bile göster)
  const showOnHomeExtra = activeCats
    .filter((c) => c.showOnHome)
    .map((c) => c.slug)
    .filter((s) => !publishedTypes.includes(s));

  // Birleştir: önce publishedTypes (kategori sırasına göre), sonra showOnHome ekstralar
  const orderedPublished = [
    ...catOrder.filter((s) => publishedTypes.includes(s)),
    ...publishedTypes.filter((s) => !catOrder.includes(s)),
  ];
  const allSlugs = [...orderedPublished, ...showOnHomeExtra];

  const typeGroups = allSlugs.map((slug) => ({
    slug,
    name: catNameBySlug[slug] ?? deriveLabel(slug),
    description: categories.find((c) => c.slug === slug)?.description ?? null,
    programs: programs.filter((p) => p.type === slug),
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
              <div className="mb-8 flex items-center justify-between border-b border-[var(--border)] pb-3">
                <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-[var(--text-primary)]">
                  {group.name}
                </p>
                <Link
                  href={`/${group.slug}`}
                  className="text-[11px] text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)] transition-colors"
                >
                  Tümünü Gör →
                </Link>
              </div>

              {group.programs.length > 0 ? (
                <div className="grid grid-cols-1 gap-px bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
                  {group.programs.map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 border border-dashed border-[var(--border)]">
                  <p className="text-sm text-[var(--text-muted)]">Henüz yayınlanmış program bulunmuyor.</p>
                  {group.description && (
                    <p className="text-xs text-[var(--text-disabled)]">{group.description}</p>
                  )}
                </div>
              )}
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
