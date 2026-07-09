"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { HomeWorkshop, HomeCertificate, HomeCategory, HeroBannerConfig } from "@/lib/home-content";
import type { AtolyeBizConfig, TrustBadgesConfig, NewsletterConfig, CollectionsConfig } from "@/lib/site-content";

const _DEF_ATOLYE_BIZ: AtolyeBizConfig = {
  heading: "Atölye Biz", description: "Takı tasarımını keşfetmek, üretim süreçlerini öğrenmek ve kendi parçanı yaratmak için programlarımıza katılabilirsin.", linkText: "Tüm Programları İncele →",
  workshops: { title: "Atölyeler", sub: "Takı tasarımı ve el işçiliği atölyeleri", imageUrl: null, imageId: null },
  certificates: { title: "Sertifikalar", sub: "Profesyonel sertifika programları", imageUrl: null, imageId: null },
};
const _DEF_TRUST: TrustBadgesConfig = { badges: [
  { icon: "shipping", title: "Ücretsiz Kargo", sub: "Tüm siparişlerde" },
  { icon: "handmade", title: "El Yapımı", sub: "Tüm ürünler el yapımıdır" },
  { icon: "return", title: "İade & Değişim", sub: "14 gün içinde kolay iade" },
  { icon: "secure", title: "Güvenli Ödeme", sub: "256-bit SSL koruması" },
]};
const _DEF_NEWSLETTER: NewsletterConfig = {
  heading: "Yeniliklerden Haberdar Ol", description: "Koleksiyonlar, atölye duyuruları ve özel indirimlerden ilk sen haberdar ol.",
  instagramUrl: "#", pinterestUrl: "#", youtubeUrl: "#", email: "info@tubaatman.com",
};

const ease = [0.16, 1, 0.3, 1] as const;

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

export function HeroSection({ config }: { config: HeroBannerConfig }) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "calc(100svh - 104px)", minHeight: "520px" }}
    >
      {/* Arka plan görseli */}
      <Image
        src={config.imageUrl}
        alt="Tuba Atman Mücevher Atölyesi"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Koyu katman — sola doğru metni okunur kılar */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(20,10,5,0.78) 0%, rgba(20,10,5,0.50) 50%, rgba(20,10,5,0.18) 100%)",
        }}
      />

      {/* Alt degrade — diğer seksiyonlara yumuşak geçiş */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(245,237,224,0.55))",
        }}
      />

      {/* İçerik */}
      <div className="relative h-full mx-auto max-w-7xl px-6 flex items-center">
        <div className="max-w-xl">
          {config.eyebrow && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease }}
              className="mb-5 text-[10px] font-medium tracking-[0.35em] uppercase text-white/70"
            >
              {config.eyebrow}
            </motion.p>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.25, ease }}
            className="mb-3 leading-none tracking-tight text-white"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontWeight: 700,
              fontSize: "clamp(3.8rem, 9vw, 7rem)",
            }}
          >
            {config.title}
          </motion.h1>

          {config.location && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.38, ease }}
              className="mb-8 text-[12px] tracking-[0.35em] uppercase text-white/60"
            >
              {config.location}
            </motion.p>
          )}

          {config.description && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.48, ease }}
              className="mb-10 max-w-sm text-[15px] leading-relaxed text-white/80"
            >
              {config.description}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.62, ease }}
            className="flex flex-wrap gap-4"
          >
            {config.btn1Text && (
              <Link
                href={config.btn1Href || "/atolyeler"}
                className="inline-flex h-12 items-center justify-center bg-white px-9 text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--text-primary)] transition-opacity hover:opacity-85"
              >
                {config.btn1Text}
              </Link>
            )}
            {config.btn2Text && (
              <Link
                href={config.btn2Href || "/iletisim"}
                className="inline-flex h-12 items-center justify-center border border-white/50 px-9 text-[11px] font-medium tracking-[0.2em] uppercase text-white transition-all hover:border-white hover:bg-white/10"
              >
                {config.btn2Text}
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* Aşağı kaydır oku */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="h-9 w-px bg-gradient-to-b from-white/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}

// ─── Collections ─────────────────────────────────────────────────────────────

const COLLECTIONS_TOP = [
  { slug: "kolyeler", label: "Kolyeler", bg: "#e2cdb5" },
  { slug: "yuzukler", label: "Yüzükler", bg: "#d6c9b4" },
];

const COLLECTIONS_BOTTOM = [
  { slug: "kupeler", label: "Küpeler", bg: "#dfc8ae" },
  { slug: "bileklikler", label: "Bileklikler", bg: "#cfc5b6" },
  { slug: "charmlar", label: "Charm'lar", bg: "#d9d3c6" },
];

function CollectionCard({
  slug,
  label,
  bg,
  imageUrl = null,
  delay = 0,
}: {
  slug: string;
  label: string;
  bg: string;
  imageUrl?: string | null;
  delay?: number;
}) {
  return (
    <FadeUp delay={delay}>
      <Link
        href={`/koleksiyonlar/${slug}`}
        className="group block"
        aria-label={label}
      >
        {/* Görsel alanı */}
        <div
          className="relative aspect-[3/4] overflow-hidden mb-4"
          style={{ background: bg }}
        >
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={label}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          )}
          {/* Dekoratif halka SVG */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg
              viewBox="0 0 120 120"
              fill="none"
              stroke="#2c1810"
              strokeWidth="0.6"
              className="w-2/3 h-2/3 opacity-[0.15]"
              aria-hidden
            >
              <circle cx="60" cy="60" r="55" />
              <circle cx="60" cy="60" r="44" />
              <circle cx="60" cy="60" r="33" />
              <circle cx="60" cy="60" r="22" />
              <circle cx="60" cy="60" r="11" />
            </svg>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-[#2c1810]/0 group-hover:bg-[#2c1810]/8 transition-colors duration-500" />

          {/* Hover ölçek efekti — iç kapsayıcı */}
          <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105 origin-center" />
        </div>

        {/* Metin */}
        <p
          className="mb-1 text-[11px] font-semibold tracking-[0.22em] uppercase"
          style={{ color: "#2c1810", fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {label}
        </p>
        <p
          className="text-[12px] tracking-[0.08em] transition-opacity duration-300 opacity-60 group-hover:opacity-100"
          style={{ color: "#2c1810" }}
        >
          Keşfet →
        </p>
      </Link>
    </FadeUp>
  );
}

const _DEF_COLLECTIONS: CollectionsConfig = {
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

export function CollectionsSection({ config }: { config?: CollectionsConfig }) {
  const cfg = config ?? _DEF_COLLECTIONS;
  const topRow = cfg.items.slice(0, 2);
  const bottomRow = cfg.items.slice(2);
  const bottomCols = bottomRow.length === 1 ? "sm:grid-cols-1" : bottomRow.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";

  return (
    <section style={{ background: "#f5ede0" }} className="py-20">
      {/* Üst yatay çizgi */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="w-full h-px mb-12" style={{ background: "#2c1810", opacity: 0.15 }} />
      </div>

      {/* Başlık */}
      <FadeUp className="mb-14 text-center px-6">
        <h2
          className="mb-4 tracking-[0.25em] uppercase"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontWeight: 600,
            fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
            color: "#2c1810",
            letterSpacing: "0.25em",
          }}
        >
          {cfg.heading}
        </h2>
        <p className="mb-3 text-[20px]" style={{ color: "#8b2e1a" }} aria-hidden>♥</p>
        <p className="text-[13px] tracking-[0.04em] leading-relaxed" style={{ color: "#2c1810", opacity: 0.6 }}>
          {cfg.description}
        </p>
      </FadeUp>

      {/* Kart grid'i */}
      <div className="mx-auto max-w-7xl px-6 space-y-4">
        {/* Üst satır */}
        {topRow.length > 0 && (
          <div className={`grid grid-cols-1 gap-4 ${topRow.length === 1 ? "" : "sm:grid-cols-2"}`}>
            {topRow.map((col, i) => (
              <CollectionCard
                key={col.slug}
                slug={col.slug}
                label={col.label}
                bg={col.bg}
                imageUrl={col.imageUrl}
                delay={i * 0.08}
              />
            ))}
          </div>
        )}
        {/* Alt satır */}
        {bottomRow.length > 0 && (
          <div className={`grid grid-cols-1 gap-4 ${bottomCols}`}>
            {bottomRow.map((col, i) => (
              <CollectionCard
                key={col.slug}
                slug={col.slug}
                label={col.label}
                bg={col.bg}
                imageUrl={col.imageUrl}
                delay={0.16 + i * 0.08}
              />
            ))}
          </div>
        )}
      </div>

      {/* Alt yatay çizgi */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="w-full h-px mt-14" style={{ background: "#2c1810", opacity: 0.15 }} />
      </div>
    </section>
  );
}

// ─── Atölye Biz ──────────────────────────────────────────────────────────────

const BASE_BG = ["#2c1810", "#3d2010", "#1a1008", "#4a2418", "#2a1505"];

function slugToLabel(slug: string): string {
  const MAP: Record<string, string> = {
    atolyeler: "Atölyeler",
    sertifikalar: "Sertifikalar",
    masterclass: "Masterclass",
  };
  return MAP[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
}

function AtolyeBizProgramCard({
  program,
  typeName,
  bg,
}: {
  program: HomeWorkshop;
  typeName: string;
  bg: string;
}) {
  return (
    <Link href={`/${program.type}/${program.slug}`} className="group block">
      {/* Üstte tip etiketi */}
      <p className="mb-2.5 text-[9px] font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">
        {typeName}
      </p>
      {/* Görsel */}
      <div className="relative aspect-[3/4] overflow-hidden mb-3" style={{ background: bg }}>
        {program.coverImage?.url ? (
          <Image
            src={program.coverImage.url}
            alt={program.title}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-end p-5">
            <svg className="w-8 h-8 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
              <path d="M12 2L14.4 9.2H22L16 13.8L18.4 21L12 16.4L5.6 21L8 13.8L2 9.2H9.6L12 2Z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
      {/* Altta program adı */}
      <p className="text-[13px] font-medium leading-snug text-[var(--text-primary)] transition-colors group-hover:text-[var(--text-secondary)]">
        {program.title}
      </p>
      <p className="mt-1 text-[11px] text-[var(--text-muted)]">
        {Number(program.basePrice).toLocaleString("tr-TR")} ₺
      </p>
    </Link>
  );
}

export function AtolyeBizSection({
  workshops,
  categories = [],
  atolyeBizConfig,
}: {
  workshops: HomeWorkshop[];
  categories?: HomeCategory[];
  atolyeBizConfig?: AtolyeBizConfig;
}) {
  const config = atolyeBizConfig ?? _DEF_ATOLYE_BIZ;

  // categories = hem yayında programı olan tipler hem showOnHome açık kategoriler
  // Kaynak olarak her zaman categories kullan; program varsa kartları, yoksa tip kartını göster
  if (categories.length > 0) {
    const typeGroups = categories.map((cat, gi) => ({
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      bg: BASE_BG[gi % BASE_BG.length],
      programs: workshops.filter((w) => w.type === cat.slug),
    }));

    return (
      <section className="bg-[var(--bg-subtle)] border-t border-[var(--border)] py-20">
        <div className="mx-auto max-w-7xl px-6">
          {/* Bölüm başlığı */}
          <FadeUp className="mb-14 max-w-xl">
            <h2
              className="mb-3 text-[32px] leading-tight tracking-tight text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 700, textTransform: "uppercase" }}
            >
              {config.heading}
            </h2>
            <p className="mb-4 text-[var(--text-muted)] text-lg">♥</p>
            <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
              {config.description}
            </p>
            <Link
              href="/programlar"
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-[var(--text-primary)] underline underline-offset-4 hover:text-[var(--text-secondary)] transition-colors"
            >
              {config.linkText}
            </Link>
          </FadeUp>

          {/* Tip grupları */}
          <div className="flex flex-col gap-16">
            {typeGroups.map((group) => (
              <div key={group.slug}>
                {/* Grup başlığı */}
                <div className="mb-6 flex items-center justify-between border-b border-[var(--border)] pb-3">
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
                  /* Yayında program varsa program kartları */
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {group.programs.slice(0, 3).map((program, i) => (
                      <FadeUp key={program.id} delay={i * 0.1}>
                        <AtolyeBizProgramCard program={program} typeName={group.name} bg={group.bg} />
                      </FadeUp>
                    ))}
                  </div>
                ) : (
                  /* Henüz yayında program yok — tip kartı göster */
                  <FadeUp>
                    <Link href={`/${group.slug}`} className="group block max-w-xs">
                      <div className="relative aspect-[3/4] overflow-hidden mb-3" style={{ background: group.bg }}>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute bottom-5 left-5">
                          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/90">{group.name}</p>
                        </div>
                      </div>
                      <p className="text-[13px] font-medium text-[var(--text-primary)] group-hover:text-[var(--text-secondary)] transition-colors">
                        {group.name}
                      </p>
                      {group.description && (
                        <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{group.description}</p>
                      )}
                    </Link>
                  </FadeUp>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Kategori de yok, program da yok — sadece başlık
  return (
    <section className="bg-[var(--bg-subtle)] border-t border-[var(--border)] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <FadeUp className="max-w-xl">
          <h2
            className="mb-3 text-[32px] leading-tight tracking-tight text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 700, textTransform: "uppercase" }}
          >
            {config.heading}
          </h2>
          <p className="mb-4 text-[var(--text-muted)] text-lg">♥</p>
          <p className="text-[14px] leading-relaxed text-[var(--text-secondary)] max-w-xs">
            {config.description}
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── Güven rozetleri ──────────────────────────────────────────────────────────

function BadgeIcon({ icon }: { icon: "shipping" | "handmade" | "return" | "secure" }) {
  if (icon === "shipping") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8 mx-auto mb-3">
        <path d="M5 8h14M5 8a2 2 0 01-2-2V4M5 8l-1 12h16L19 8M19 8a2 2 0 002-2V4M9 14v4M15 14v4M3 4h18" />
      </svg>
    );
  }
  if (icon === "handmade") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8 mx-auto mb-3">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  }
  if (icon === "return") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8 mx-auto mb-3">
        <path d="M1 4v6h6M23 20v-6h-6" />
        <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" />
      </svg>
    );
  }
  // secure
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-8 h-8 mx-auto mb-3">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

export function TrustBadgesSection({ config }: { config?: TrustBadgesConfig }) {
  const badges = (config ?? _DEF_TRUST).badges;

  return (
    <section className="bg-[var(--bg)] border-t border-[var(--border)] py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {badges.map((b) => (
            <div
              key={b.title}
              className="text-center text-[var(--text-muted)]"
            >
              <BadgeIcon icon={b.icon} />
              <p className="mb-1 text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--text-primary)]">
                {b.title}
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">{b.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Bülten + Sosyal ─────────────────────────────────────────────────────────

export function NewsletterSection({ config }: { config?: NewsletterConfig }) {
  const c = config ?? _DEF_NEWSLETTER;

  return (
    <section className="bg-[var(--bg-subtle)] border-t border-[var(--border)] py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
          {/* Sol */}
          <div>
            <p className="mb-2 text-[13px] font-semibold tracking-[0.12em] uppercase text-[var(--text-primary)]">
              {c.heading}
            </p>
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
              {c.description}
            </p>
          </div>

          {/* Orta — form */}
          <form className="flex gap-0" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="flex-1 h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] outline-none focus:border-[var(--text-primary)] transition-colors"
            />
            <button
              type="submit"
              className="h-11 bg-[var(--text-primary)] px-6 text-[11px] font-medium tracking-[0.15em] uppercase text-[var(--surface)] hover:opacity-80 transition-opacity"
            >
              Kaydol
            </button>
          </form>

          {/* Sağ — sosyal medya */}
          <div className="md:text-right">
            <p className="mb-3 text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--text-primary)]">
              Bizi Takip Et
            </p>
            <div className="flex items-center gap-4 md:justify-end">
              <a
                href={c.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>
              <a
                href={c.pinterestUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.853 0 1.268.64 1.268 1.408 0 .858-.546 2.14-.828 3.33-.236.995.499 1.806 1.476 1.806 1.772 0 3.137-1.868 3.137-4.563 0-2.386-1.716-4.053-4.165-4.053-2.837 0-4.502 2.128-4.502 4.327 0 .857.33 1.775.741 2.276a.3.3 0 01.069.283c-.076.315-.245.995-.278 1.134-.044.181-.145.219-.334.132-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.966-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.938.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                </svg>
              </a>
              <a
                href={c.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden
                >
                  <path d="M22.54 6.42A2.78 2.78 0 0020.77 4.6C19.25 4.18 12 4.18 12 4.18s-7.24 0-8.77.42A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.77 1.82c1.53.42 8.77.42 8.77.42s7.24 0 8.77-.42a2.78 2.78 0 001.77-1.82A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
                  <polygon
                    points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>
              <a
                href={`mailto:${c.email}`}
                aria-label="E-posta"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M2 7l10 7 10-7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Geriye dönük uyumluluk ───────────────────────────────────────────────────

export function HeroScene() {
  return null;
}
export function MarqueeStrip() {
  return null;
}
export function StatsSection() {
  return null;
}
export function ProcessSection() {
  return null;
}
export function WorkshopsSection({ workshops }: { workshops: HomeWorkshop[] }) {
  return <AtolyeBizSection workshops={workshops} />;
}

export function StorySection() {
  return null;
}
export function CertificatesSection({
  certificates,
}: {
  certificates: HomeCertificate[];
}) {
  void certificates;
  return null;
}
export function CTASection() {
  return null;
}
