import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sayfa bulunamadı" };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6 text-center">
      <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
        <svg viewBox="0 0 120 120" fill="none" stroke="#2c1810" strokeWidth="0.7" className="absolute inset-0 h-full w-full opacity-20" aria-hidden>
          <circle cx="60" cy="60" r="55" /><circle cx="60" cy="60" r="40" /><circle cx="60" cy="60" r="25" />
        </svg>
        <span className="text-4xl font-light text-[var(--text-primary)]" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>404</span>
      </div>
      <h1 className="mb-3 text-2xl font-light tracking-tight text-[var(--text-primary)] sm:text-3xl" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
        Bu sayfayı bulamadık
      </h1>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
        Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir. Aşağıdan devam edebilirsiniz.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="inline-flex h-11 items-center bg-[var(--text-primary)] px-6 text-[12px] font-semibold uppercase tracking-[0.15em] text-[var(--surface)] transition-colors hover:bg-[var(--accent-hover)]">
          Ana sayfa
        </Link>
        <Link href="/programlar" className="inline-flex h-11 items-center border border-[var(--border-strong)] px-6 text-[12px] font-semibold uppercase tracking-[0.15em] text-[var(--text-primary)] transition-colors hover:bg-[var(--text-primary)] hover:text-[var(--surface)]">
          Programlar
        </Link>
        <Link href="/blog" className="inline-flex h-11 items-center text-[12px] font-semibold uppercase tracking-[0.15em] text-[var(--text-primary)] underline underline-offset-[6px] decoration-[var(--border-strong)]">
          Blog
        </Link>
      </div>
    </main>
  );
}
