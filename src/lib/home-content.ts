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

// Türkçe isim fallback'leri — kategori kaydı yoksa type slug'ından türetilir
const TYPE_NAME_FALLBACKS: Record<string, string> = {
  atolyeler: "Atölyeler",
  sertifikalar: "Sertifikalar",
  masterclass: "Masterclass",
};

function typeLabel(slug: string): string {
  return TYPE_NAME_FALLBACKS[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
}

export async function getHomePageData() {
  const [publishedTypes, workshopsRaw, categoriesRaw, heroBannerEntry] = await Promise.all([
    // Yayındaki tüm program tiplerini bul
    db.program.findMany({
      where: { status: "published" },
      select: { type: true },
      distinct: ["type"],
    }),
    // Kategori kartlarında kapak resmi göstermek için yayındaki programlar
    db.program.findMany({
      where: { status: "published" },
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        basePrice: true,
        coverImage: { select: { url: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    // Tüm kategori kayıtları — aktif/pasif ayrımı burada yapılacak
    db.programCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    db.siteContent.findUnique({
      where: { key_locale: { key: "hero_banner", locale: "tr" } },
    }),
  ]);

  const heroBanner: HeroBannerConfig = heroBannerEntry?.value
    ? { ...DEFAULT_HERO_BANNER, ...(heroBannerEntry.value as Partial<HeroBannerConfig>) }
    : DEFAULT_HERO_BANNER;

  // Pasif olarak işaretlenmiş kategorilerin slug'ları — bu tipler gösterilmez
  const blockedSlugs = new Set(
    categoriesRaw.filter((c) => !c.isActive).map((c) => c.slug)
  );

  // Yalnızca aktif kategorileri kullan
  const activeCats = categoriesRaw.filter((c) => c.isActive);
  const catBySlug = Object.fromEntries(activeCats.map((c) => [c.slug, c]));

  // Yayında program olan tipler — pasif kategoriler hariç
  const publishedSlugs = publishedTypes
    .map((p) => p.type)
    .filter((s) => !blockedSlugs.has(s));

  // showOnHome açık aktif kategoriler (programsız olsa bile göster)
  const showOnHomeSlugs = activeCats
    .filter((c) => c.showOnHome)
    .map((c) => c.slug)
    .filter((s) => !publishedSlugs.includes(s));

  const allSlugs = [...publishedSlugs, ...showOnHomeSlugs];

  // Sırala: sortOrder'ı olan kategoriler önce
  allSlugs.sort((a, b) => {
    const catA = catBySlug[a];
    const catB = catBySlug[b];
    if (catA && catB) return catA.sortOrder - catB.sortOrder;
    if (catA) return -1;
    if (catB) return 1;
    return 0;
  });

  const categories = allSlugs.map((slug) => {
    const cat = catBySlug[slug];
    return {
      id: cat?.id ?? `_${slug}`,
      name: cat?.name ?? typeLabel(slug),
      slug,
      description: cat?.description ?? null,
      sortOrder: cat?.sortOrder ?? 99,
      showOnHome: cat?.showOnHome ?? true,
      isActive: true,
      createdAt: cat?.createdAt ?? new Date(),
      updatedAt: cat?.updatedAt ?? new Date(),
      _count: { programs: 0 },
    };
  });

  // Kategori yoksa uydurma kart basılmaz: eskiden burada sabit "Atölyeler" ve
  // "Sertifikalar" kartları vardı, panelden silinseler bile anasayfada
  // görünmeye devam ediyor ve yönetilemiyorlardı.
  return { categories, heroBanner, workshops: workshopsRaw };
}

export type HomeCategory = Awaited<ReturnType<typeof getHomePageData>>["categories"][number];
export type HomeWorkshop = Awaited<ReturnType<typeof getHomePageData>>["workshops"][number];
export type HomeCertificate = HomeWorkshop;
