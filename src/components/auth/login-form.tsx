"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { ResendVerification } from "@/components/auth/resend-verification";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUnverified(false);

    const result = await signIn.email({ email, password });

    if (result.error) {
      if (result.error.code === "EMAIL_NOT_VERIFIED") {
        setUnverified(true);
      } else {
        setError("E-posta veya şifre hatalı.");
      }
      setLoading(false);
      return;
    }

    window.location.href = redirect;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
          E-posta
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
          placeholder="ornek@email.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
            Şifre
          </label>
          <Link href="/sifremi-unuttum" className="text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)]">
            Unuttum
          </Link>
        </div>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)]"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">{error}</p>
      )}

      {unverified && (
        <div className="flex flex-col gap-3 border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
          <p role="alert" className="text-sm leading-relaxed text-[var(--text-muted)]">
            <span className="font-medium text-[var(--text-primary)]">
              E-posta adresiniz doğrulanmamış.
            </span>{" "}
            Kayıt sırasında gönderdiğimiz bağlantıya tıklayarak hesabınızı doğrulayın.
          </p>
          <ResendVerification email={email} />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="h-11 w-full bg-[var(--text-primary)] text-xs font-medium tracking-[0.15em] uppercase text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
    </form>
  );
}
