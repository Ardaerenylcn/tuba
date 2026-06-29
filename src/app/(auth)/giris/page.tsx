import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Giriş Yap" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <p className="mb-2 text-xs font-medium tracking-[0.2em] uppercase text-[var(--text-muted)]">
          Hesabınıza Giriş Yapın
        </p>
        <h1 className="text-2xl font-light tracking-tight text-[var(--text-primary)]">
          Hoş geldiniz.
        </h1>
      </div>

      <Suspense fallback={<div className="h-11 bg-[var(--bg-subtle)] animate-pulse" />}>
        <LoginForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        Hesabınız yok mu?{" "}
        <Link
          href="/kayit"
          className="text-[var(--text-primary)] underline underline-offset-4"
        >
          Kayıt olun
        </Link>
      </p>
    </div>
  );
}
