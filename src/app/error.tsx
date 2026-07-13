"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6 text-center">
      <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
        <svg viewBox="0 0 120 120" fill="none" stroke="#2c1810" strokeWidth="0.7" className="absolute inset-0 h-full w-full opacity-20" aria-hidden>
          <circle cx="60" cy="60" r="55" /><circle cx="60" cy="60" r="40" /><circle cx="60" cy="60" r="25" />
        </svg>
        <span className="text-3xl font-light text-[var(--text-primary)]" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>!</span>
      </div>
      <h1 className="mb-3 text-2xl font-light tracking-tight text-[var(--text-primary)] sm:text-3xl" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
        Bir şeyler ters gitti
      </h1>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
        Beklenmeyen bir hata oluştu. Tekrar deneyebilir veya ana sayfaya dönebilirsiniz.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={reset} className="inline-flex h-11 items-center bg-[var(--text-primary)] px-6 text-[12px] font-semibold uppercase tracking-[0.15em] text-[var(--surface)] transition-colors hover:bg-[var(--accent-hover)]">
          Tekrar dene
        </button>
        <Link href="/" className="inline-flex h-11 items-center border border-[var(--border-strong)] px-6 text-[12px] font-semibold uppercase tracking-[0.15em] text-[var(--text-primary)] transition-colors hover:bg-[var(--text-primary)] hover:text-[var(--surface)]">
          Ana sayfa
        </Link>
      </div>
    </main>
  );
}
