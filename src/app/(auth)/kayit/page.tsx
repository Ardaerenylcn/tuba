import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kayıt Ol" };

export default function RegisterPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <p className="mb-2 text-xs font-medium tracking-[0.2em] uppercase text-[var(--text-muted)]">
          Yeni Hesap
        </p>
        <h1 className="text-2xl font-light tracking-tight text-[var(--text-primary)]">
          Atölyeye katılın.
        </h1>
      </div>

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        Zaten hesabınız var mı?{" "}
        <Link
          href="/giris"
          className="text-[var(--text-primary)] underline underline-offset-4"
        >
          Giriş yapın
        </Link>
      </p>
    </div>
  );
}
