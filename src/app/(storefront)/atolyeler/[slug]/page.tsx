import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SessionCalendar } from "@/components/storefront/session-calendar";
import { FAQAccordion } from "@/components/storefront/faq-accordion";
import { ProgramGallery } from "@/components/storefront/program-gallery";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";
import type { Metadata } from "next";
import { ProgramCoverImage } from "@/components/storefront/program-cover-image";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProgram(slug: string) {
  return db.program.findUnique({
    where: { slug, status: "published" },
    include: {
      coverImage: { select: { url: true } },
      sessions: {
        where: {
          status: "published",
          startAt: { gte: new Date() },
        },
        orderBy: { startAt: "asc" },
        include: {
          instructor: { select: { id: true, name: true } },
          _count: {
            select: {
              reservations: {
                where: { status: { in: ["pending", "confirmed"] } },
              },
            },
          },
        },
      },
      requirements: { orderBy: { sortOrder: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) return {};
  const title = program.seoTitle ?? program.title;
  const description = program.seoDescription ?? program.shortDescription;
  const image = program.coverImage?.url ?? null;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(image ? { images: [{ url: image, width: 1200, height: 900 }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Başlangıç",
  intermediate: "Orta",
  advanced: "İleri",
  all_levels: "Her Seviye",
};

export default async function WorkshopDetailPage({ params }: Props) {
  const { slug } = await params;
  const program = await getProgram(slug);

  if (!program) notFound();

  const availableSessions = program.sessions.map((s) => ({
    ...s,
    bookedCount: s._count.reservations,
    availableSpots: s.capacity - s._count.reservations,
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-[1fr_360px]">
        {/* Main content */}
        <div className="lg:col-start-1 lg:row-start-1">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-xs text-[var(--text-muted)]" aria-label="Breadcrumb">
            <Link href="/atolyeler" className="hover:text-[var(--text-primary)]">Atölyeler</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">{program.title}</span>
          </nav>

          {/* Tags */}
          <div className="mb-4 flex items-center gap-3">
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--text-muted)]">
              Atölye
            </span>
            {program.level && (
              <>
                <span className="text-[var(--border-strong)]">·</span>
                <span className="text-[10px] tracking-[0.1em] text-[var(--text-muted)]">
                  {LEVEL_LABELS[program.level]}
                </span>
              </>
            )}
            {program.durationMinutes && (
              <>
                <span className="text-[var(--border-strong)]">·</span>
                <span className="text-[10px] tracking-[0.1em] text-[var(--text-muted)]">
                  {program.durationMinutes < 60
                    ? `${program.durationMinutes} dk`
                    : `${Math.floor(program.durationMinutes / 60)} sa`}
                </span>
              </>
            )}
          </div>

          <h1 className="mb-4 text-4xl font-light tracking-tight text-[var(--text-primary)] sm:text-5xl">
            {program.title}
          </h1>
          <p className="mb-10 text-lg leading-relaxed text-[var(--text-secondary)]">
            {program.shortDescription}
          </p>

          {/* Cover image */}
          <ProgramCoverImage
            url={program.coverImage?.url}
            position={program.coverImagePosition}
            alt={program.title}
          />

        </div>

        <aside className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24 lg:self-start">
          <div className="border border-[var(--border)] p-6">
            <div className="mb-5 flex items-baseline justify-between">
              <span className="text-2xl font-light text-[var(--text-primary)]">
                {Number(program.basePrice).toLocaleString("tr-TR")} ₺
              </span>
              <span className="text-xs text-[var(--text-muted)]">kişi başı</span>
            </div>

            {availableSessions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <p className="text-sm text-[var(--text-muted)]">Şu an için açık oturum bulunmuyor.</p>
                <p className="text-xs text-[var(--text-disabled)]">Yeni tarihler yakında eklenecek.</p>
              </div>
            ) : (
              <SessionCalendar
                sessions={availableSessions}
                basePrice={Number(program.basePrice)}
                currency={program.currency}
              />
            )}
          </div>
        </aside>

        <div className="lg:col-start-1 lg:row-start-2">

          {/* Description */}
          <RichTextRenderer
            content={program.description}
            className="mb-12"
          />

          {/* Gallery */}
          <ProgramGallery urls={program.galleryImageIds} />

          {/* Requirements */}
          {program.requirements.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-6 text-xl font-light text-[var(--text-primary)]">
                Program İçeriği
              </h2>
              <ol className="flex flex-col gap-4">
                {program.requirements.map((req, i) => (
                  <li key={req.id} className="flex gap-4 border-t border-[var(--border)] pt-4">
                    <span className="mt-0.5 text-xs text-[var(--text-muted)] tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{req.title}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* FAQ */}
          {program.faqs.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-6 text-xl font-light text-[var(--text-primary)]">
                Sık Sorulan Sorular
              </h2>
              <FAQAccordion items={program.faqs.map((f) => ({ q: f.question, a: f.answer }))} />
            </div>
          )}
        </div>

        {/* Sidebar — session calendar */}
      </div>
    </div>
  );
}
