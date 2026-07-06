"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FadeUp, FadeIn } from "@/components/ui/animate";
import type { HakkimizdaConfig } from "@/lib/site-content";

const ease = [0.16, 1, 0.3, 1] as const;

export function HakkimizdaContent({ config }: { config: HakkimizdaConfig }) {
  return (
    <>
      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden" style={{ height: "60vh", minHeight: "400px" }}>
        <Image
          src={config.heroImageUrl}
          alt={config.heroTitle}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(20,10,5,0.75) 0%, rgba(20,10,5,0.40) 55%, rgba(20,10,5,0.10) 100%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(245,237,224,0.6))" }}
        />
        <div className="relative h-full mx-auto max-w-7xl px-6 flex items-center">
          <div>
            {config.heroEyebrow && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease }}
                className="mb-3 text-[10px] tracking-[0.35em] uppercase text-white/60"
              >
                {config.heroEyebrow}
              </motion.p>
            )}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease }}
              className="leading-none text-white"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontWeight: 700,
                fontSize: "clamp(3rem, 7vw, 5.5rem)",
              }}
            >
              {config.heroTitle}
            </motion.h1>
            {config.heroSubtitle && (
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35, ease }}
                className="mt-4 max-w-md text-[15px] leading-relaxed text-white/75"
              >
                {config.heroSubtitle}
              </motion.p>
            )}
          </div>
        </div>
      </section>

      {/* ── Alıntı ──────────────────────────────────────────────────────── */}
      <section className="bg-[var(--bg-subtle)] border-b border-[var(--border)] px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <FadeUp>
            <p className="text-[var(--text-muted)] mb-6 text-2xl">♥</p>
            <p
              className="leading-relaxed text-[var(--text-primary)]"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontStyle: "italic",
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
              }}
            >
              &ldquo;{config.quote}&rdquo;
            </p>
            <div className="mt-8 h-px w-16 bg-[var(--border-strong)] mx-auto" />
            <p className="mt-4 text-[12px] tracking-[0.2em] uppercase text-[var(--text-muted)]">
              {config.quoteAuthor}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Hikaye ──────────────────────────────────────────────────────── */}
      <section className="bg-[var(--bg)] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:items-center">
            {/* Görsel */}
            <FadeUp>
              <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                <Image
                  src={config.storyImageUrl}
                  alt="Atölye çalışması"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 h-10 w-10 border-t-2 border-l-2 border-[var(--border-strong)] opacity-60" />
                <div className="absolute bottom-4 right-4 h-10 w-10 border-b-2 border-r-2 border-[var(--border-strong)] opacity-60" />
              </div>
            </FadeUp>

            {/* Metin */}
            <FadeUp delay={0.15}>
              {config.storyYearLabel && (
                <p className="mb-4 text-[10px] font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">
                  {config.storyYearLabel}
                </p>
              )}
              <h2
                className="mb-6 leading-snug text-[var(--text-primary)]"
                style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontWeight: 600,
                  fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
                }}
              >
                {config.storyHeading}
              </h2>
              {config.storyParagraph1 && (
                <p className="mb-4 text-[15px] leading-relaxed text-[var(--text-secondary)]">
                  {config.storyParagraph1}
                </p>
              )}
              {config.storyParagraph2 && (
                <p className="mb-8 text-[15px] leading-relaxed text-[var(--text-secondary)]">
                  {config.storyParagraph2}
                </p>
              )}
              <Link
                href="/iletisim"
                className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--text-primary)] underline underline-offset-4 hover:text-[var(--text-secondary)] transition-colors"
              >
                Bize ulaşın →
              </Link>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── İstatistikler ───────────────────────────────────────────────── */}
      {config.stats.length > 0 && (
        <section className="border-y border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-2 divide-x divide-y divide-[var(--border)] sm:grid-cols-4 sm:divide-y-0">
              {config.stats.map((s, i) => (
                <FadeIn key={s.etiket + i} delay={i * 0.08}>
                  <div className="flex flex-col items-center gap-1.5 py-10 px-4">
                    <span
                      className="text-[var(--text-primary)]"
                      style={{
                        fontFamily: "var(--font-cormorant), Georgia, serif",
                        fontWeight: 300,
                        fontSize: "clamp(2rem, 4vw, 3rem)",
                      }}
                    >
                      {s.deger}
                    </span>
                    <span className="text-center text-[11px] tracking-[0.1em] text-[var(--text-muted)]">
                      {s.etiket}
                    </span>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Değerlerimiz ────────────────────────────────────────────────── */}
      {config.values.length > 0 && (
        <section className="bg-[var(--bg)] py-24">
          <div className="mx-auto max-w-7xl px-6">
            <FadeUp className="mb-14 text-center">
              <p className="mb-3 text-[10px] font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">
                Neden Atölye Biz?
              </p>
              <h2
                className="text-[var(--text-primary)]"
                style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontWeight: 600,
                  fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
                }}
              >
                Değerlerimiz
              </h2>
            </FadeUp>

            <div className="grid grid-cols-1 gap-px bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
              {config.values.map((d, i) => (
                <FadeUp key={d.baslik + i} delay={i * 0.07}>
                  <div className="flex flex-col gap-4 bg-[var(--bg)] p-8 h-full hover:bg-[var(--bg-subtle)] transition-colors">
                    <p
                      className="text-[var(--text-disabled)]"
                      style={{
                        fontFamily: "var(--font-cormorant), Georgia, serif",
                        fontSize: "2.5rem",
                        fontWeight: 300,
                        lineHeight: 1,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <div className="h-px w-8 bg-[var(--border-strong)]" />
                    <h3 className="text-[14px] font-semibold tracking-wide text-[var(--text-primary)]">
                      {d.baslik}
                    </h3>
                    <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
                      {d.aciklama}
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Görsel bant ─────────────────────────────────────────────────── */}
      <section className="relative h-72 overflow-hidden">
        <Image
          src={config.bannerImageUrl}
          alt="Takı tasarım"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0" style={{ background: "rgba(20,10,5,0.52)" }} />
        <div className="relative h-full flex items-center justify-center text-center px-6">
          <FadeUp>
            <p
              className="text-white"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontStyle: "italic",
                fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)",
                fontWeight: 300,
              }}
            >
              &ldquo;{config.bannerQuote}&rdquo;
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Harekete geçirici ────────────────────────────────────────────── */}
      <section className="bg-[var(--bg-subtle)] border-t border-[var(--border)] py-24 px-6">
        <div className="mx-auto max-w-7xl text-center">
          <FadeUp>
            <p className="mb-3 text-[10px] font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">
              Bize Katılın
            </p>
            <h2
              className="mb-8 text-[var(--text-primary)]"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontWeight: 600,
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              }}
            >
              {config.ctaHeading}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {config.ctaBtn1Text && (
                <Link
                  href={config.ctaBtn1Href || "/atolyeler"}
                  className="inline-flex h-12 items-center justify-center bg-[var(--text-primary)] px-10 text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--surface)] hover:opacity-80 transition-opacity"
                >
                  {config.ctaBtn1Text}
                </Link>
              )}
              {config.ctaBtn2Text && (
                <Link
                  href={config.ctaBtn2Href || "/iletisim"}
                  className="inline-flex h-12 items-center justify-center border border-[var(--border-strong)] px-10 text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {config.ctaBtn2Text}
                </Link>
              )}
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
