import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SessionCalendar } from "@/components/storefront/session-calendar";
import { FAQAccordion } from "@/components/storefront/faq-accordion";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";
import { getProgramReviews } from "@/lib/reviews";
import { getSession } from "@/lib/auth-server";
import { FavoriteButton } from "@/components/storefront/favorite-button";
import type { Metadata } from "next";
import { ProgramMedia } from "@/components/storefront/program-media";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://tubaatman.com";

function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5" fill={i <= Math.round(rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2" aria-hidden>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15l-5.2 2.6 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

interface Props {
  params: Promise<{ programType: string; slug: string }>;
}

async function getProgram(slug: string, type: string) {
  return db.program.findUnique({
    where: { slug, status: "published", type },
    include: {
      coverImage: { select: { url: true } },
      galleryImages: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { url: true, media: { select: { altText: true } } },
      },
      sessions: {
        where: { status: "published", startAt: { gte: new Date() } },
        orderBy: { startAt: "asc" },
        include: {
          instructor: { select: { id: true, name: true } },
          _count: {
            select: {
              reservations: { where: { status: { in: ["pending", "confirmed"] } } },
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
  const { slug, programType } = await params;
  const program = await getProgram(slug, programType);
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
  };
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Başlangıç",
  intermediate: "Orta",
  advanced: "İleri",
  all_levels: "Her Seviye",
};

export default async function DynamicProgramDetailPage({ params }: Props) {
  const { slug, programType } = await params;
  const program = await getProgram(slug, programType);
  if (!program) notFound();

  const cat = await db.programCategory.findUnique({ where: { slug: programType } });

  const auth = await getSession();
  const isFavorited = auth
    ? Boolean(await db.favorite.findUnique({ where: { userId_programId: { userId: auth.user.id, programId: program.id } } }))
    : false;

  const availableSessions = program.sessions.map((s) => ({
    ...s,
    bookedCount: s._count.reservations,
    availableSpots: s.capacity - s._count.reservations,
  }));

  const reviews = await getProgramReviews(program.id, 8);
  const avgRating = reviews.length
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.title,
    description: program.shortDescription,
    provider: { "@type": "Organization", name: "Tuba Atman Jewelry", sameAs: BASE },
    ...(program.coverImage?.url ? { image: program.coverImage.url } : {}),
    ...(reviews.length
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating,
            reviewCount: reviews.length,
            bestRating: 5,
          },
          review: reviews.slice(0, 5).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.name },
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
            reviewBody: r.body,
            datePublished: r.createdAt,
          })),
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-[1fr_360px]">
        <div className="lg:col-start-1 lg:row-start-1">
          <nav className="mb-8 flex items-center gap-2 text-xs text-[var(--text-muted)]" aria-label="Breadcrumb">
            <Link href={`/${programType}`} className="hover:text-[var(--text-primary)]">
              {cat?.name ?? programType}
            </Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">{program.title}</span>
          </nav>

          <div className="mb-4 flex items-center gap-3">
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--text-muted)]">
              {cat?.name ?? programType}
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
                  {program.durationMinutes < 60 ? `${program.durationMinutes} dk` : `${Math.floor(program.durationMinutes / 60)} sa`}
                </span>
              </>
            )}
          </div>

          <h1 className="mb-4 text-4xl font-light tracking-tight text-[var(--text-primary)] sm:text-5xl">
            {program.title}
          </h1>
          <p className="mb-6 text-lg leading-relaxed text-[var(--text-secondary)]">
            {program.shortDescription}
          </p>
          <div className="mb-10">
            <FavoriteButton programId={program.id} initialFavorited={isFavorited} isLoggedIn={!!auth} variant="labeled" />
          </div>

          <ProgramMedia
            coverUrl={program.coverImage?.url}
            coverPosition={program.coverImagePosition}
            images={program.galleryImages.map((g) => ({ url: g.url, alt: g.media?.altText }))}
            title={program.title}
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

          <RichTextRenderer content={program.description} className="mb-12" />

          {program.requirements.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-6 text-xl font-light text-[var(--text-primary)]">Program İçeriği</h2>
              <ol className="flex flex-col gap-4">
                {program.requirements.map((req, i) => (
                  <li key={req.id} className="flex gap-4 border-t border-[var(--border)] pt-4">
                    <span className="mt-0.5 text-xs text-[var(--text-muted)] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{req.title}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {program.faqs.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-6 text-xl font-light text-[var(--text-primary)]">Sık Sorulan Sorular</h2>
              <FAQAccordion items={program.faqs.map((f) => ({ q: f.question, a: f.answer }))} />
            </div>
          )}

          {reviews.length > 0 && (
            <div className="mb-4 border-t border-[var(--border)] pt-10">
              <div className="mb-6 flex items-center gap-3">
                <h2 className="text-xl font-light text-[var(--text-primary)]">Katılımcı Yorumları</h2>
                <span className="flex items-center gap-1.5 text-[var(--accent)]">
                  <Stars rating={avgRating} />
                  <span className="text-sm font-medium text-[var(--text-primary)]">{avgRating.toFixed(1)}</span>
                  <span className="text-xs text-[var(--text-muted)]">({reviews.length})</span>
                </span>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {reviews.map((r) => (
                  <figure key={r.id} className="flex flex-col gap-3 border border-[var(--border)] bg-[var(--surface)] p-5">
                    <Stars rating={r.rating} className="text-[var(--accent)]" />
                    <blockquote className="text-sm leading-relaxed text-[var(--text-secondary)]">“{r.body}”</blockquote>
                    <figcaption className="text-xs font-medium text-[var(--text-primary)]">{r.name}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
