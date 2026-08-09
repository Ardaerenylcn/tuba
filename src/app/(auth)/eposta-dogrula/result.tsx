"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ResendVerification } from "@/components/auth/resend-verification";

const ERROR_MESSAGES: Record<string, string> = {
  TOKEN_EXPIRED: "Doğrulama bağlantısının süresi dolmuş. Yeni bir bağlantı isteyin.",
  INVALID_TOKEN: "Doğrulama bağlantısı geçersiz. Yeni bir bağlantı isteyin.",
  USER_NOT_FOUND: "Bu adrese ait bir hesap bulunamadı.",
};

export function VerifyEmailResult() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (error) {
    return (
      <>
        <div className="mb-8">
          <p className="mb-2 text-xs font-medium tracking-[0.2em] uppercase text-[var(--text-muted)]">
            Doğrulanamadı
          </p>
          <h1 className="text-2xl font-light tracking-tight text-[var(--text-primary)]">
            Bir sorun çıktı.
          </h1>
          <p role="alert" className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
            {ERROR_MESSAGES[error] ?? "E-posta adresiniz doğrulanamadı. Lütfen tekrar deneyin."}
          </p>
        </div>

        <ResendVerification />

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          <Link href="/giris" className="text-[var(--text-primary)] underline underline-offset-4">
            Giriş sayfasına dön
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <p className="mb-2 text-xs font-medium tracking-[0.2em] uppercase text-[var(--text-muted)]">
          Doğrulandı
        </p>
        <h1 className="text-2xl font-light tracking-tight text-[var(--text-primary)]">
          E-posta adresiniz onaylandı.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
          Hesabınız hazır. Artık atölyelere kayıt olabilirsiniz.
        </p>
      </div>

      <Link
        href="/"
        className="flex h-11 w-full items-center justify-center bg-[var(--text-primary)] text-xs font-medium tracking-[0.15em] uppercase text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)]"
      >
        Ana Sayfaya Git
      </Link>
    </>
  );
}
