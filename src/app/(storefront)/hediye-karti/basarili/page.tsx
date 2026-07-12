import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hediye Kartı Gönderildi" };

interface Props {
  searchParams: Promise<{ code?: string; value?: string; rn?: string; re?: string; exp?: string }>;
}

function formatDateTR(iso?: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul",
  }).format(new Date(iso));
}

async function Content({ searchParams }: Props) {
  const { code, value, rn, re, exp } = await searchParams;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-20 text-center">
      <div className="mb-8 flex h-16 w-16 items-center justify-center border border-[var(--border)]">
        <svg className="h-6 w-6 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <p className="mb-3 text-xs font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">Gönderildi</p>
      <h1 className="mb-4 text-3xl font-light tracking-tight text-[var(--text-primary)]">
        Hediye kartınız yolda! 🎁
      </h1>
      <p className="mb-10 text-base leading-relaxed text-[var(--text-secondary)]">
        {rn ? <><strong>{rn}</strong> için hazırladığınız e-hediye kartı </> : "E-hediye kartı "}
        {re ? <><strong>{re}</strong> adresine </> : ""}
        e-posta ile gönderildi. Bir kopyası da size iletildi.
      </p>

      {/* Sertifika */}
      {code && (
        <div className="mb-10 w-full overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] bg-[var(--bg-subtle)] px-6 py-3">
            <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-[var(--text-muted)]">
              Tuba Atman Jewelry · E-Hediye Kartı
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 px-6 py-8">
            {value && (
              <p className="text-4xl font-light text-[var(--text-primary)]">
                {Number(value).toLocaleString("tr-TR")} ₺
              </p>
            )}
            <div className="flex flex-col items-center gap-1">
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--text-muted)]">Kod</p>
              <p className="font-mono text-xl tracking-[0.2em] text-[var(--text-primary)]">{code}</p>
            </div>
            {exp && (
              <p className="text-xs text-[var(--text-muted)]">
                Son kullanma: {formatDateTR(exp)}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link href="/takvim" className="inline-flex h-11 items-center justify-center border border-[var(--border-strong)] px-6 text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-primary)] transition-colors hover:border-[var(--text-primary)]">
          Takvimi Gör
        </Link>
        <Link href="/" className="text-sm text-[var(--text-secondary)] underline underline-offset-4 transition-colors hover:text-[var(--text-primary)]">
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}

export default function GiftCardSuccessPage(props: Props) {
  return (
    <Suspense fallback={<div className="flex min-h-[300px] items-center justify-center"><p className="text-sm text-[var(--text-muted)]">Yükleniyor...</p></div>}>
      <Content {...props} />
    </Suspense>
  );
}
