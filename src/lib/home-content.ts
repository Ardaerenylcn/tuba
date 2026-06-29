import { db } from "@/lib/db";

export async function getHomePageData() {
  const [workshopsRaw, certificatesRaw] = await Promise.all([
    db.program.findMany({
      where: { status: "published", type: "workshop" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        coverImage: { select: { url: true } },
        sessions: {
          where: { status: "published", startAt: { gte: new Date() } },
          orderBy: { startAt: "asc" },
          take: 1,
          select: { startAt: true, priceOverride: true },
        },
      },
    }),
    db.program.findMany({
      where: { status: "published", type: "certificate" },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        coverImage: { select: { url: true } },
        sessions: {
          where: { status: "published", startAt: { gte: new Date() } },
          orderBy: { startAt: "asc" },
          take: 1,
          select: { startAt: true },
        },
      },
    }),
  ]);

  // Serialize Prisma Decimal fields before passing to Client Components
  const workshops = workshopsRaw.map((w) => ({
    ...w,
    basePrice: Number(w.basePrice),
    sessions: w.sessions.map((s) => ({
      startAt: s.startAt,
      priceOverride: s.priceOverride != null ? Number(s.priceOverride) : null,
    })),
  }));

  const certificates = certificatesRaw.map((c) => ({
    ...c,
    basePrice: Number(c.basePrice),
    sessions: c.sessions.map((s) => ({ startAt: s.startAt })),
  }));

  return { workshops, certificates };
}

export type HomeWorkshop = Awaited<ReturnType<typeof getHomePageData>>["workshops"][number];
export type HomeCertificate = Awaited<ReturnType<typeof getHomePageData>>["certificates"][number];
