"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { HeroScene } from "./hero-scene";
import type { HomeWorkshop, HomeCertificate } from "@/lib/home-content";

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
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

export function HeroSection() {
  return (
    <section className="relative min-h-svh overflow-hidden bg-[var(--color-stone-950)]">
      {/* 3D ring — right half on desktop, full-bg on mobile */}
      <div className="absolute inset-0 lg:left-[44%]">
        <HeroScene />
        {/* fade left edge on desktop so ring never peeks behind the text content */}
        <div className="absolute inset-y-0 left-0 w-24 hidden lg:block bg-gradient-to-r from-[var(--color-stone-950)] to-transparent" />
        {/* gradient mask so ring blends into dark bg on mobile */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-stone-950)] via-[var(--color-stone-950)]/60 to-transparent lg:hidden" />
      </div>

      {/* Text content */}
      <div className="relative z-10 flex min-h-svh items-center">
        <div className="mx-auto w-full max-w-6xl px-6 py-32">
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease }}
              className="mb-6 text-[10px] font-medium tracking-[0.35em] uppercase text-[var(--color-stone-400)]"
            >
              Takı Tasarım Kursu · İstanbul
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease }}
              className="mb-3 text-5xl font-light leading-[1.08] tracking-tight text-[var(--color-stone-50)] sm:text-6xl lg:text-7xl"
            >
              Atölye Biz
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease }}
              className="mb-8 text-lg font-light text-[var(--color-warm-300)] sm:text-xl"
            >
              Kuyumculuk ve Mücevher Eğitimleri
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.45, ease }}
              className="mb-12 max-w-sm text-base leading-relaxed text-[var(--color-stone-400)] sm:text-lg"
            >
              Küçük gruplarla yürütülen atölye programlarında gümüş, altın ve
              taş işleme sanatını öğren. Her seviyeye uygun oturumlar,
              deneyimli eğitmenler.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.62, ease }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link
                href="/atolyeler"
                className="inline-flex h-12 items-center justify-center bg-[var(--color-warm-400)] px-8 text-xs font-medium tracking-[0.15em] uppercase text-[var(--color-stone-950)] transition-colors hover:bg-[var(--color-warm-300)]"
              >
                Atölyeleri İncele
              </Link>
              <Link
                href="/sertifikalar"
                className="inline-flex h-12 items-center justify-center border border-[var(--color-stone-600)] px-8 text-xs font-medium tracking-[0.15em] uppercase text-[var(--color-stone-300)] transition-colors hover:border-[var(--color-stone-400)] hover:text-[var(--color-stone-100)]"
              >
                Sertifika Programları
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] tracking-[0.3em] uppercase text-[var(--color-stone-600)]">
          Keşfet
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="h-8 w-px bg-gradient-to-b from-[var(--color-stone-600)] to-transparent"
        />
      </motion.div>
    </section>
  );
}

// ─── Marquee ─────────────────────────────────────────────────────────────────

const MARQUEE_ITEMS = [
  "Gümüş Kuyumculuk",
  "Taş Kakma",
  "Ring Yapımı",
  "Küpe Tasarımı",
  "El İşçiliği",
  "Altın İşleme",
  "Tel Sarma",
  "Kolye Yapımı",
];

export function MarqueeStrip() {
  const all = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className="overflow-hidden border-y border-[var(--border)] bg-[var(--bg-subtle)] py-3.5">
      <div
        className="flex w-max whitespace-nowrap"
        style={{ animation: "marquee 32s linear infinite" }}
      >
        {all.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-6 pr-6 text-[10px] font-medium tracking-[0.25em] uppercase text-[var(--text-muted)]"
          >
            {item}
            <span
              className="inline-block h-1 w-1 rounded-full bg-[var(--color-warm-400)]"
              aria-hidden
            />
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export function StatsSection() {
  const stats = [
    { value: "8", label: "Yıllık Deneyim" },
    { value: "1.200+", label: "Mezun Öğrenci" },
    { value: "≤6", label: "Kişilik Gruplar" },
    { value: "3", label: "Uzman Eğitmen" },
  ];

  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 divide-x divide-y divide-[var(--border)] sm:grid-cols-4 sm:divide-y-0">
          {stats.map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.08}>
              <div className="flex flex-col items-center justify-center gap-1.5 px-4 py-10">
                <span className="text-3xl font-light tracking-tight text-[var(--text-primary)] sm:text-4xl">
                  {s.value}
                </span>
                <span className="text-center text-[10px] tracking-[0.12em] text-[var(--text-muted)]">
                  {s.label}
                </span>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Process ─────────────────────────────────────────────────────────────────

export function ProcessSection() {
  const steps = [
    {
      num: "01",
      title: "Programını seç",
      desc: "Seviyene ve ilgi alanına uygun bir atölye veya sertifika programına göz at.",
    },
    {
      num: "02",
      title: "Oturumunu ayır",
      desc: "Müsait olduğun tarihi seç, kısa formu doldur. Yer ayırtmak birkaç dakika.",
    },
    {
      num: "03",
      title: "Gel, yarat",
      desc: "Küçük grupta, deneyimli eğitmenle. Gün sonunda elinden çıkan bir takı seninle gidiyor.",
    },
  ];

  return (
    <section className="border-b border-[var(--border)] bg-[var(--bg-subtle)] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp className="mb-16">
          <p className="mb-3 text-[10px] font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">
            Nasıl İşliyor?
          </p>
          <h2 className="text-3xl font-light tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Üç adımda başla.
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-0">
          {steps.map((step, i) => (
            <FadeUp key={step.num} delay={i * 0.12} className="sm:pr-14">
              <div className="border-t-2 border-[var(--color-warm-400)] pt-6">
                <span className="mb-5 block text-5xl font-light text-[var(--color-stone-200)]">
                  {step.num}
                </span>
                <h3 className="mb-3 text-base font-medium text-[var(--text-primary)]">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {step.desc}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Workshops ───────────────────────────────────────────────────────────────

function WorkshopCard({ w, index }: { w: HomeWorkshop; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const nextSession = w.sessions[0];
  const price = nextSession?.priceOverride ?? w.basePrice;
  const href = `/atolyeler/${w.slug}`;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: (index % 3) * 0.1, ease }}
      className="group relative flex flex-col overflow-hidden border border-[var(--border)] bg-[var(--surface)] transition-shadow duration-300 hover:shadow-[0_8px_32px_0_rgb(0,0,0,0.08)]"
    >
      <Link href={href} className="block overflow-hidden">
        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--bg-muted)]">
          {w.coverImage?.url ? (
            <Image
              src={w.coverImage.url}
              alt={w.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-muted)]">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-disabled)]">
                Atölye
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-[var(--color-stone-950)]/0 transition-colors duration-500 group-hover:bg-[var(--color-stone-950)]/8" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--text-muted)]">
            Atölye
          </p>
          {w.level && (
            <>
              <span className="text-[var(--border-strong)]">·</span>
              <p className="text-[10px] tracking-[0.1em] text-[var(--text-muted)]">
                {{
                  beginner: "Başlangıç",
                  intermediate: "Orta",
                  advanced: "İleri",
                  all_levels: "Her Seviye",
                }[w.level] ?? w.level}
              </p>
            </>
          )}
        </div>
        <Link href={href}>
          <h3 className="mb-2 text-base font-medium leading-snug text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
            {w.title}
          </h3>
        </Link>
        <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
          {w.shortDescription}
        </p>
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
          <div>
            <span className="text-base font-light text-[var(--text-primary)]">
              {price.toLocaleString("tr-TR")} ₺
            </span>
            <span className="ml-1 text-[11px] text-[var(--text-muted)]">/ kişi</span>
          </div>
          {nextSession ? (
            <span className="text-[11px] text-[var(--text-muted)]">
              {new Intl.DateTimeFormat("tr-TR", {
                day: "numeric",
                month: "short",
                timeZone: "Europe/Istanbul",
              }).format(new Date(nextSession.startAt))}
            </span>
          ) : (
            <span className="text-[11px] text-[var(--text-disabled)]">Yakında</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function WorkshopsSection({ workshops }: { workshops: HomeWorkshop[] }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <FadeUp className="mb-14 flex items-end justify-between">
        <div>
          <p className="mb-3 text-[10px] font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">
            Programlar
          </p>
          <h2 className="text-3xl font-light tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Atölyeler
          </h2>
        </div>
        <Link
          href="/atolyeler"
          className="hidden text-sm text-[var(--text-secondary)] underline underline-offset-4 transition-colors hover:text-[var(--text-primary)] sm:block"
        >
          Tümünü gör
        </Link>
      </FadeUp>

      {workshops.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workshops.map((w, i) => (
            <WorkshopCard key={w.id} w={w} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[240px] items-center justify-center border border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)]">
            Yakında yeni atölyeler eklenecek.
          </p>
        </div>
      )}

      <div className="mt-6 sm:hidden">
        <Link
          href="/atolyeler"
          className="text-sm text-[var(--text-secondary)] underline underline-offset-4"
        >
          Tüm atölyeleri gör
        </Link>
      </div>
    </section>
  );
}

// ─── Story ───────────────────────────────────────────────────────────────────

export function StorySection() {
  const techniques = ["Gümüş Tel İşleme", "Taş Kakma", "Altın Kaplama", "Granül Tekniği"];

  return (
    <section className="border-t border-[var(--color-stone-800)] bg-[var(--color-stone-900)]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          {/* Text */}
          <FadeUp>
            <p className="mb-6 text-[10px] font-medium tracking-[0.35em] uppercase text-[var(--color-stone-500)]">
              Atölye Hikayesi
            </p>
            <h2 className="mb-6 text-3xl font-light leading-snug tracking-tight text-[var(--color-stone-50)] sm:text-4xl">
              Her takıda bir emeğin,<br />
              bir anın izi var.
            </h2>
            <p className="mb-4 text-base leading-relaxed text-[var(--color-stone-400)]">
              2016&rsquo;dan bu yana küçük gruplarla çalışıyor, her katılımcıya kendi
              sesini metal üzerinde bulma fırsatı sunuyoruz. Atölyemiz; bir kurs
              mekânı değil, el işçiliğinin yaşatıldığı bir alan.
            </p>
            <p className="mb-8 text-base leading-relaxed text-[var(--color-stone-400)]">
              Gümüş, altın ve taş işleme tekniklerini öğretirken her öğrencinin
              kendi tasarım sesini bulmasına rehberlik ediyoruz.
            </p>
            <Link
              href="/hakkimizda"
              className="inline-flex items-center gap-2 text-sm text-[var(--color-stone-300)] transition-colors hover:text-[var(--color-stone-50)]"
            >
              Hikayemizi oku
              <span aria-hidden>→</span>
            </Link>
          </FadeUp>

          {/* Editorial tile grid */}
          <FadeUp delay={0.15}>
            <div className="grid grid-cols-2 divide-x divide-y divide-[var(--color-stone-700)] border border-[var(--color-stone-700)]">
              {/* Year */}
              <div className="p-8">
                <p className="text-5xl font-light text-[var(--color-stone-50)]">2016</p>
                <p className="mt-2 text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--color-stone-500)]">
                  Kuruluş Yılı
                </p>
              </div>

              {/* Graduates */}
              <div className="p-8">
                <p className="text-5xl font-light text-[var(--color-warm-400)]">1.200+</p>
                <p className="mt-2 text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--color-stone-500)]">
                  Mezun
                </p>
              </div>

              {/* Techniques */}
              <div className="flex flex-col justify-center gap-3 p-8">
                {techniques.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <div className="h-px w-4 bg-[var(--color-warm-500)]" />
                    <p className="text-xs font-light text-[var(--color-stone-300)]">{t}</p>
                  </div>
                ))}
              </div>

              {/* Decorative ring SVG */}
              <div className="flex items-center justify-center p-8">
                <svg
                  viewBox="0 0 100 100"
                  className="w-28 h-28 opacity-50"
                  aria-hidden
                >
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="#d49a50"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50" cy="50" r="26"
                    fill="none"
                    stroke="#d49a50"
                    strokeWidth="1"
                    strokeDasharray="3 5"
                    opacity="0.5"
                  />
                </svg>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ─── Certificates ────────────────────────────────────────────────────────────

function CertificateCard({ c, index }: { c: HomeCertificate; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const href = `/sertifikalar/${c.slug}`;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.12, ease }}
      className="group relative flex flex-col border border-[var(--border)] bg-[var(--surface)] transition-shadow duration-300 hover:shadow-[0_8px_32px_0_rgb(0,0,0,0.08)]"
    >
      <Link href={href} className="block overflow-hidden">
        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--bg-muted)]">
          {c.coverImage?.url ? (
            <Image
              src={c.coverImage.url}
              alt={c.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-muted)]">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-disabled)]">
                Sertifika
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2 text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--accent)]">
          Sertifika Programı
        </p>
        <Link href={href}>
          <h3 className="mb-2 text-lg font-light text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
            {c.title}
          </h3>
        </Link>
        <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
          {c.shortDescription}
        </p>
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
          <span className="text-base font-light text-[var(--text-primary)]">
            {c.basePrice.toLocaleString("tr-TR")} ₺
          </span>
          <Link
            href={href}
            className="text-xs text-[var(--text-muted)] underline underline-offset-4 transition-colors hover:text-[var(--text-primary)]"
          >
            İncele →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function CertificatesSection({ certificates }: { certificates: HomeCertificate[] }) {
  if (certificates.length === 0) return null;

  return (
    <section className="border-t border-[var(--border)] bg-[var(--bg-subtle)] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp className="mb-14 flex items-end justify-between">
          <div>
            <p className="mb-3 text-[10px] font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">
              Sertifika Programları
            </p>
            <h2 className="text-3xl font-light tracking-tight text-[var(--text-primary)] sm:text-4xl">
              Ustalığa giden yol
            </h2>
          </div>
          <Link
            href="/sertifikalar"
            className="hidden text-sm text-[var(--text-secondary)] underline underline-offset-4 transition-colors hover:text-[var(--text-primary)] sm:block"
          >
            Tümünü gör
          </Link>
        </FadeUp>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((c, i) => (
            <CertificateCard key={c.id} c={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-stone-950)] py-32">
      {/* Subtle warm glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
        style={{
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, #d49a50 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <FadeUp>
          <p className="mb-4 text-[10px] font-medium tracking-[0.35em] uppercase text-[var(--color-stone-500)]">
            Başlamaya Hazır mısın?
          </p>
          <h2 className="mb-6 text-3xl font-light tracking-tight text-[var(--color-stone-50)] sm:text-4xl lg:text-5xl">
            Sana uygun bir oturum bul.
          </h2>
          <p className="mx-auto mb-10 max-w-md text-base text-[var(--color-stone-400)]">
            Hâlâ bir sorun mu var? Bize yazın — doğru programa yönlendirelim.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/atolyeler"
              className="inline-flex h-12 items-center justify-center bg-[var(--color-warm-400)] px-10 text-xs font-medium tracking-[0.15em] uppercase text-[var(--color-stone-950)] transition-colors hover:bg-[var(--color-warm-300)]"
            >
              Rezervasyon Yap
            </Link>
            <Link
              href="/iletisim"
              className="inline-flex h-12 items-center justify-center border border-[var(--color-stone-700)] px-10 text-xs font-medium tracking-[0.15em] uppercase text-[var(--color-stone-400)] transition-colors hover:border-[var(--color-stone-500)] hover:text-[var(--color-stone-200)]"
            >
              İletişime Geç
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
