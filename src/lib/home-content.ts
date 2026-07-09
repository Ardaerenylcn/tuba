import { db } from "@/lib/db";

export interface HeroBannerConfig {
  imageUrl: string;
  imageId: string | null;
  eyebrow: string;
  title: string;
  location: string;
  description: string;
  btn1Text: string;
  btn1Href: string;
  btn2Text: string;
  btn2Href: string;
}

export const DEFAULT_HERO_BANNER: HeroBannerConfig = {
  imageUrl: "/pic_01.jpeg",
  imageId: null,
  eyebrow: "Sevgiyle el yapımı ♥",
  title: "ATÖLYE BİZ",
  location: "İstanbul'da",
  description: "Çağdaş takı tasarımını, el işçiliğini ve yaratıcı atölye deneyimlerini birlikte keşfedelim.",
  btn1Text: "Keşfet",
  btn1Href: "/atolyeler",
  btn2Text: "İletişim",
  btn2Href: "/iletisim",
};

export async function getHomePageData() {
  const [workshopsRaw, certificatesRaw, categoriesRaw, heroBannerEntry] = await Promise.all([
    db.program.findMany({
      where: { status: "published", type: "atolyeler" },
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
      where: { status: "published", type: "sertifikalar" },
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
    db.programCategory.findMany({
      where: { showOnHome: true, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { programs: true } } },
    }),
    db.siteContent.findUnique({
      where: { key_locale: { key: "hero_banner", locale: "tr" } },
    }),
  ]);

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

  const heroBanner: HeroBannerConfig = heroBannerEntry?.value
    ? { ...DEFAULT_HERO_BANNER, ...(heroBannerEntry.value as Partial<HeroBannerConfig>) }
    : DEFAULT_HERO_BANNER;

  // DB'de hiç kategori yoksa varsayılan 2 kategori göster (admin'den henüz eklenmemişse)
  const DEFAULT_CATEGORIES = [
    { id: "_atolyeler", name: "Atölyeler", slug: "atolyeler", description: "El yapımı takı atölyeleri", sortOrder: 0, showOnHome: true, isActive: true, createdAt: new Date(), updatedAt: new Date(), _count: { programs: 0 } },
    { id: "_sertifikalar", name: "Sertifikalar", slug: "sertifikalar", description: "Sertifika programları", sortOrder: 1, showOnHome: true, isActive: true, createdAt: new Date(), updatedAt: new Date(), _count: { programs: 0 } },
  ];
  const categories = categoriesRaw.length > 0 ? categoriesRaw : DEFAULT_CATEGORIES;

  return { workshops, certificates, categories, heroBanner };
}

export type HomeWorkshop = Awaited<ReturnType<typeof getHomePageData>>["workshops"][number];
export type HomeCertificate = Awaited<ReturnType<typeof getHomePageData>>["certificates"][number];
export type HomeCategory = Awaited<ReturnType<typeof getHomePageData>>["categories"][number];
