import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Rezervasyon Alındı" };

export default function ReservationSuccessPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-32 text-center">
      {/* Icon */}
      <div className="mb-8 flex h-16 w-16 items-center justify-center border border-[var(--border)]">
        <svg
          className="h-6 w-6 text-[var(--text-primary)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <p className="mb-3 text-xs font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">
        Tamamlandı
      </p>
      <h1 className="mb-4 text-3xl font-light tracking-tight text-[var(--text-primary)]">
        Rezervasyonunuz alındı.
      </h1>
      <p className="mb-10 text-base leading-relaxed text-[var(--text-secondary)]">
        Onay bilgileri e-posta adresinize gönderildi. Görüşmek üzere!
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/atolyeler"
          className="inline-flex h-11 items-center justify-center border border-[var(--border-strong)] px-6 text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-primary)] transition-colors hover:border-[var(--text-primary)]"
        >
          Diğer Atölyeler
        </Link>
        <Link
          href="/"
          className="text-sm text-[var(--text-secondary)] underline underline-offset-4 transition-colors hover:text-[var(--text-primary)]"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
