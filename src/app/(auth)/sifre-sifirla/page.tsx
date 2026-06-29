import { Suspense } from "react";
import { ResetPasswordForm } from "./form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Şifre Sıfırla | Atölye Biz" };

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <p className="mb-2 text-xs font-medium tracking-[0.2em] uppercase text-[var(--text-muted)]">
          Yeni Şifre
        </p>
        <h1 className="text-2xl font-light tracking-tight text-[var(--text-primary)]">
          Şifrenizi belirleyin.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
          En az 8 karakter içeren yeni bir şifre seçin.
        </p>
      </div>

      <Suspense fallback={<div className="h-11 bg-[var(--bg-subtle)] animate-pulse" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
