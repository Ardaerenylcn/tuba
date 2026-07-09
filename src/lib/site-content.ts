import { db } from "@/lib/db";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface AnnouncementBarConfig {
  text: string;
  visible: boolean;
}

export interface AtolyeBizConfig {
  heading: string;
  description: string;
  linkText: string;
  workshops: {
    title: string;
    sub: string;
    imageUrl: string | null;
    imageId: string | null;
  };
  certificates: {
    title: string;
    sub: string;
    imageUrl: string | null;
    imageId: string | null;
  };
}

export interface TrustBadgesConfig {
  badges: Array<{
    icon: "shipping" | "handmade" | "return" | "secure";
    title: string;
    sub: string;
  }>;
}

export interface NewsletterConfig {
  heading: string;
  description: string;
  instagramUrl: string;
  pinterestUrl: string;
  youtubeUrl: string;
  email: string;
}

export interface ContactConfig {
  phone: string;
  whatsapp: string;
  instagram: string;
  location: string;
  weekdays: string;
  saturday: string;
  sunday: string;
}

export interface SssItem {
  q: string;
  a: string;
}

export interface SssConfig {
  items: SssItem[];
}

export const DEFAULT_SSS: SssConfig = {
  items: [
    { q: "Hiç deneyimim yok, başlayabilir miyim?", a: "Evet, kesinlikle! Atölyelerimizin büyük bölümü hiçbir deneyim gerektirmiyor. Başlangıç seviyesi programlarımız sıfırdan başlayanlar için özel olarak tasarlanmıştır. İlk derste tüm temel teknikleri öğretiyoruz." },
    { q: "Derse hangi malzemeleri getirmem gerekiyor?", a: "Hiçbir şey getirmenize gerek yok. Tüm malzeme ve ekipman atölyemiz tarafından sağlanır. Derste yaptığınız takılar size aittir, evinize götürürsünüz." },
    { q: "Grup büyüklüğü ne kadar?", a: "Atölyelerimizde maksimum 6 kişilik gruplarla çalışıyoruz. Bu sayede her katılımcıya yeterli ilgi ve rehberlik sunabiliyoruz." },
    { q: "Rezervasyon yapmak için ödeme yapmak zorunda mıyım?", a: "Şu an için rezervasyonunuzu onaylamak ücretsizdir. Ödeme atölye günü nakit veya kredi kartıyla yapılabilir. Yakında online ödeme seçeneği de sunulacaktır." },
    { q: "İptal veya değişiklik yapabilir miyim?", a: "Atölye tarihinden 48 saat öncesine kadar rezervasyonunuzu ücretsiz iptal edebilir veya tarih değiştirebilirsiniz. Daha geç iptal durumunda ücret politikamız için lütfen bize ulaşın." },
    { q: "Sertifika programları ne kadar sürer?", a: "Sertifika programlarımız konuya göre 8 ila 24 haftalık modüller şeklinde sunulmaktadır. Program detay sayfasında süreyi görebilirsiniz." },
    { q: "Atölye nerede bulunuyor?", a: "Atölyemiz İstanbul'dadır. Kesin adres bilgisi rezervasyon onayı sonrası tarafınıza iletilmektedir. Daha fazla bilgi için bize ulaşabilirsiniz." },
    { q: "Özel etkinlik veya kurumsal eğitim düzenliyor musunuz?", a: "Evet! Doğum günü, bekarlığa veda gibi özel etkinlikler ile kurumsal ekip aktiviteleri için özel atölye düzenleyebiliyoruz. Detaylar için iletişim formunu kullanın." },
    { q: "Çocuklar da katılabilir mi?", a: "16 yaş ve üzeri bireyler ebeveyn eşliğinde atölyelerimize katılabilmektedir. 18 yaş üzeri kısıtlama olmaksızın tüm programlara kayıt olunabilir." },
    { q: "Derse katılamayacak olursam ne olur?", a: "48 saatten fazla önceden haber verirseniz yerinizi başka bir tarihe taşıyabiliyoruz. Sertifika programlarında kaçırılan dersler için telafi seçeneği sunulmaktadır." },
  ],
};

export async function getSssConfig(): Promise<SssConfig> {
  const entry = await db.siteContent.findUnique({
    where: { key_locale: { key: "sss", locale: "tr" } },
  });
  if (!entry?.value) return DEFAULT_SSS;
  const raw = entry.value as Partial<SssConfig>;
  return { items: raw.items ?? DEFAULT_SSS.items };
}

export interface CollectionItem {
  slug: string;
  label: string;
  bg: string;
  imageUrl: string | null;
  imageId: string | null;
}

export interface CollectionsConfig {
  heading: string;
  description: string;
  items: CollectionItem[];
}

export interface HakkimizdaConfig {
  heroImageUrl: string;
  heroImageId: string | null;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  quote: string;
  quoteAuthor: string;
  storyImageUrl: string;
  storyImageId: string | null;
  storyYearLabel: string;
  storyHeading: string;
  storyParagraph1: string;
  storyParagraph2: string;
  stats: { deger: string; etiket: string }[];
  values: { baslik: string; aciklama: string }[];
  bannerImageUrl: string;
  bannerImageId: string | null;
  bannerQuote: string;
  ctaHeading: string;
  ctaBtn1Text: string;
  ctaBtn1Href: string;
  ctaBtn2Text: string;
  ctaBtn2Href: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_ANNOUNCEMENT_BAR: AnnouncementBarConfig = {
  text: "Ücretsiz kargo tüm siparişlerde",
  visible: true,
};

export const DEFAULT_ATOLYE_BIZ: AtolyeBizConfig = {
  heading: "Atölye Biz",
  description:
    "Takı tasarımını keşfetmek, üretim süreçlerini öğrenmek ve kendi parçanı yaratmak için programlarımıza katılabilirsin.",
  linkText: "Tüm Programları İncele →",
  workshops: {
    title: "Atölyeler",
    sub: "Takı tasarımı ve el işçiliği atölyeleri",
    imageUrl: null,
    imageId: null,
  },
  certificates: {
    title: "Sertifikalar",
    sub: "Profesyonel sertifika programları",
    imageUrl: null,
    imageId: null,
  },
};

export const DEFAULT_TRUST_BADGES: TrustBadgesConfig = {
  badges: [
    { icon: "shipping", title: "Ücretsiz Kargo", sub: "Tüm siparişlerde" },
    { icon: "handmade", title: "El Yapımı", sub: "Tüm ürünler el yapımıdır" },
    { icon: "return", title: "İade & Değişim", sub: "14 gün içinde kolay iade" },
    { icon: "secure", title: "Güvenli Ödeme", sub: "256-bit SSL koruması" },
  ],
};

export const DEFAULT_NEWSLETTER: NewsletterConfig = {
  heading: "Yeniliklerden Haberdar Ol",
  description:
    "Koleksiyonlar, atölye duyuruları ve özel indirimlerden ilk sen haberdar ol.",
  instagramUrl: "#",
  pinterestUrl: "#",
  youtubeUrl: "#",
  email: "info@tubaatman.com",
};

export const DEFAULT_CONTACT_INFO: ContactConfig = {
  phone: "+90 532 517 51 71",
  whatsapp: "905325175171",
  instagram: "tubaatmanjewelry",
  location: "İstanbul, Türkiye",
  weekdays: "10:00 – 19:00",
  saturday: "10:00 – 17:00",
  sunday: "Kapalı",
};

export const DEFAULT_COLLECTIONS: CollectionsConfig = {
  heading: "Koleksiyonlar",
  description: "Zamansız tasarımlar, el işçiliğiyle hayat bulur.",
  items: [
    { slug: "kolyeler", label: "Kolyeler", bg: "#e2cdb5", imageUrl: null, imageId: null },
    { slug: "yuzukler", label: "Yüzükler", bg: "#d6c9b4", imageUrl: null, imageId: null },
    { slug: "kupeler", label: "Küpeler", bg: "#dfc8ae", imageUrl: null, imageId: null },
    { slug: "bileklikler", label: "Bileklikler", bg: "#cfc5b6", imageUrl: null, imageId: null },
    { slug: "charmlar", label: "Charm'lar", bg: "#d9d3c6", imageUrl: null, imageId: null },
  ],
};

export const DEFAULT_HAKKIMIZDA: HakkimizdaConfig = {
  heroImageUrl: "/pic_01.jpeg",
  heroImageId: null,
  heroEyebrow: "Hikayemiz",
  heroTitle: "Hakkımızda",
  heroSubtitle: "İstanbul'un kalbinde, el işçiliğinin yaşatıldığı bir atölye.",
  quote: "Takı; metal ile emeğin buluştuğu andır. Biz o anı öğretiyoruz.",
  quoteAuthor: "Tuba Atman",
  storyImageUrl: "/pic_02.jpeg",
  storyImageId: null,
  storyYearLabel: "Başlangıç · 2016",
  storyHeading: "Her takıda bir emeğin, bir anın izi var.",
  storyParagraph1: "2016 yılında küçük bir takı merakıyla başlayan bu yolculuk, bugün yüzlerce öğrencinin kendi tasarım sesini bulduğu bir atölyeye dönüştü. Gümüş, altın, taş işleme ve mücevher tasarımının farklı dallarında eğitimler sunuyoruz.",
  storyParagraph2: "Atölyemizde maksimum 6 kişilik gruplarla çalışıyoruz. Bu sayede her öğrenciye kişisel ilgi gösteriyor, kendi hızında ilerlemesine olanak tanıyoruz.",
  stats: [
    { deger: "2016", etiket: "Kuruluş Yılı" },
    { deger: "1.200+", etiket: "Mezun Öğrenci" },
    { deger: "≤6", etiket: "Kişilik Gruplar" },
    { deger: "100+", etiket: "Tamamlanan Program" },
  ],
  values: [
    { baslik: "Küçük Gruplar", aciklama: "Maksimum 6 kişilik gruplar. Her katılımcıya özel ilgi, kişisel gelişim odaklı atölye deneyimi." },
    { baslik: "Kaliteli Malzeme", aciklama: "Gerçek gümüş, altın ve değerli taşlarla çalışıyoruz. Yaptığınız takıları eve götürüyorsunuz." },
    { baslik: "Deneyimli Eğitmenler", aciklama: "Yıllarca sektörde çalışmış ustaların rehberliğinde, doğru tekniklerle öğrenin." },
    { baslik: "Her Seviyeye Uygun", aciklama: "Hiç deneyiminiz olmasa da başlayabilirsiniz. Başlangıçtan ileri düzeye programlar." },
    { baslik: "Sertifikalı Eğitim", aciklama: "Tamamladığınız sertifika programları için resmi belge düzenliyoruz." },
    { baslik: "Güvenli Atölye", aciklama: "Profesyonel ekipman, güvenli çalışma ortamı ve sürekli eğitmen gözetimi." },
  ],
  bannerImageUrl: "/hero-banner.webp",
  bannerImageId: null,
  bannerQuote: "Kendi takını yaratmanın zamanı geldi.",
  ctaHeading: "Kendi takınızı tasarlayın.",
  ctaBtn1Text: "Atölyeleri İncele",
  ctaBtn1Href: "/atolyeler",
  ctaBtn2Text: "İletişime Geç",
  ctaBtn2Href: "/iletisim",
};

// ─── Typed site content map ───────────────────────────────────────────────────

export interface SiteContentMap {
  announcement_bar: AnnouncementBarConfig;
  atolye_biz: AtolyeBizConfig;
  trust_badges: TrustBadgesConfig;
  newsletter: NewsletterConfig;
  contact_info: ContactConfig;
  collections: CollectionsConfig;
}

const SITE_CONTENT_KEYS = [
  "announcement_bar",
  "atolye_biz",
  "trust_badges",
  "newsletter",
  "contact_info",
  "collections",
] as const;

export async function getHakkimizdaConfig(): Promise<HakkimizdaConfig> {
  const entry = await db.siteContent.findUnique({
    where: { key_locale: { key: "hakkimizda", locale: "tr" } },
  });
  if (!entry?.value) return DEFAULT_HAKKIMIZDA;
  const v = entry.value as Partial<HakkimizdaConfig>;
  return {
    ...DEFAULT_HAKKIMIZDA,
    ...v,
    stats: v.stats ?? DEFAULT_HAKKIMIZDA.stats,
    values: v.values ?? DEFAULT_HAKKIMIZDA.values,
  };
}

export async function getAllSiteContent(): Promise<SiteContentMap> {
  const entries = await db.siteContent.findMany({
    where: { key: { in: [...SITE_CONTENT_KEYS] }, locale: "tr" },
  });

  const map = Object.fromEntries(entries.map((e) => [e.key, e.value])) as Record<string, unknown>;

  return {
    announcement_bar: map["announcement_bar"]
      ? { ...DEFAULT_ANNOUNCEMENT_BAR, ...(map["announcement_bar"] as Partial<AnnouncementBarConfig>) }
      : DEFAULT_ANNOUNCEMENT_BAR,
    atolye_biz: map["atolye_biz"]
      ? { ...DEFAULT_ATOLYE_BIZ, ...(map["atolye_biz"] as Partial<AtolyeBizConfig>) }
      : DEFAULT_ATOLYE_BIZ,
    trust_badges: map["trust_badges"]
      ? { ...DEFAULT_TRUST_BADGES, ...(map["trust_badges"] as Partial<TrustBadgesConfig>) }
      : DEFAULT_TRUST_BADGES,
    newsletter: map["newsletter"]
      ? { ...DEFAULT_NEWSLETTER, ...(map["newsletter"] as Partial<NewsletterConfig>) }
      : DEFAULT_NEWSLETTER,
    contact_info: map["contact_info"]
      ? { ...DEFAULT_CONTACT_INFO, ...(map["contact_info"] as Partial<ContactConfig>) }
      : DEFAULT_CONTACT_INFO,
    collections: (() => {
      const raw = map["collections"] as Partial<CollectionsConfig> | undefined;
      if (!raw) return DEFAULT_COLLECTIONS;
      return {
        ...DEFAULT_COLLECTIONS,
        ...raw,
        items: (raw.items ?? DEFAULT_COLLECTIONS.items).map((item) => ({
          ...item,
          imageUrl: item.imageUrl ?? null,
          imageId: item.imageId ?? null,
        })),
      };
    })(),
  };
}
