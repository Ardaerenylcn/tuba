import { ForgotPasswordForm } from "./form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Şifremi Unuttum | Atölye Biz" };

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <p className="mb-2 text-xs font-medium tracking-[0.2em] uppercase text-[var(--text-muted)]">
          Şifre Sıfırlama
        </p>
        <h1 className="text-2xl font-light tracking-tight text-[var(--text-primary)]">
          Şifremi unuttum.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
          Kayıtlı e-posta adresinizi girin, sıfırlama bağlantısını göndereceğiz.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        Hatırladınız mı?{" "}
        <a href="/giris" className="text-[var(--text-primary)] underline underline-offset-4">
          Giriş yapın
        </a>
      </p>
    </div>
  );
}
