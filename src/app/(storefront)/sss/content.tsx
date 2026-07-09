"use client";

import Link from "next/link";
import { FadeUp } from "@/components/ui/animate";
import { PageHero } from "@/components/storefront/page-hero";
import { FAQAccordion } from "@/components/storefront/faq-accordion";
import type { SssItem } from "@/lib/site-content";

export function SSSContent({ items }: { items: SssItem[] }) {
  return (
    <>
      <PageHero
        eyebrow="Yardım"
        title="Sık Sorulan Sorular"
        description="Aklınızdaki soruların cevabını burada bulamazsanız bize yazın."
      />

      <div className="mx-auto max-w-3xl px-6 py-20">
        <FadeUp>
          <FAQAccordion items={items} />
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="mt-16 flex flex-col items-center gap-4 border border-[var(--border)] bg-[var(--bg-subtle)] px-8 py-10 text-center">
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--text-muted)]">
              Hâlâ sorunuz var mı?
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Her soruyu buraya sığdıramıyoruz. Doğrudan ulaşın.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/iletisim"
                className="inline-flex h-10 items-center justify-center bg-[var(--text-primary)] px-6 text-xs font-medium tracking-[0.1em] uppercase text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)]"
              >
                Bize Yazın
              </Link>
              <a
                href="tel:+905325175171"
                className="inline-flex h-10 items-center justify-center border border-[var(--border-strong)] px-6 text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-primary)] transition-colors hover:bg-[var(--text-primary)] hover:text-[var(--surface)]"
              >
                +90 532 517 51 71
              </a>
            </div>
          </div>
        </FadeUp>
      </div>
    </>
  );
}
