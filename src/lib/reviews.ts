import { db } from "@/lib/db";

export interface PublicReview {
  id: string;
  name: string;
  avatarUrl: string | null;
  rating: number;
  body: string;
  programTitle: string | null;
  createdAt: string;
}

function toPublic(r: {
  id: string; authorName: string; displayName: string | null; avatarUrl: string | null;
  rating: number; body: string; createdAt: Date; program: { title: string } | null;
}): PublicReview {
  return {
    id: r.id,
    name: r.displayName || r.authorName,
    avatarUrl: r.avatarUrl,
    rating: r.rating,
    body: r.body,
    programTitle: r.program?.title ?? null,
    createdAt: r.createdAt.toISOString(),
  };
}

const includeProgram = { program: { select: { title: true } } } as const;

/** Anasayfa için yayında yorumlar (öne çıkanlar önce). */
export async function getHomepageReviews(limit = 6): Promise<PublicReview[]> {
  const rows = await db.review.findMany({
    where: { status: "published" },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
    include: includeProgram,
  });
  return rows.map(toPublic);
}

/** Footer için öne çıkarılmış yorumlar (yoksa son yayınlananlar). */
export async function getFeaturedReviews(limit = 5): Promise<PublicReview[]> {
  const featured = await db.review.findMany({
    where: { status: "published", featured: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
    include: includeProgram,
  });
  if (featured.length > 0) return featured.map(toPublic);

  const latest = await db.review.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: includeProgram,
  });
  return latest.map(toPublic);
}

/** Belirli bir program (workshop) için yorumlar. */
export async function getProgramReviews(programId: string, limit = 8): Promise<PublicReview[]> {
  const rows = await db.review.findMany({
    where: { status: "published", programId },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: includeProgram,
  });
  return rows.map(toPublic);
}
