"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { ResendVerification } from "@/components/auth/resend-verification";

export function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signUp.email({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone || undefined,
      callbackURL: "/eposta-dogrula",
    });

    if (result.error) {
      setError(result.error.message ?? "Kayıt oluşturulamadı.");
      setLoading(false);
      return;
    }

    setSentTo(form.email);
    setLoading(false);
  }

  if (sentTo) {
    return (
      <div className="flex flex-col gap-5">
        <div className="border border-[var(--border)] bg-[var(--bg-subtle)] p-6 text-center">
          <p className="mb-1 text-sm font-medium text-[var(--text-primary)]">
            E-postanızı doğrulayın
          </p>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            <span className="text-[var(--text-primary)]">{sentTo}</span> adresine bir doğrulama
            bağlantısı gönderdik. Giriş yapabilmek için bağlantıya tıklayın.
          </p>
          <p className="mt-3 text-xs text-[var(--text-disabled)]">
            Görünmüyorsa spam klasörüne bakın. Bağlantı 24 saat geçerlidir.
          </p>
        </div>

        <ResendVerification email={sentTo} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
          Ad Soyad
        </label>
        <input
          id="name"
          type="text"
          required
          autoComplete="name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
          placeholder="Adınız ve soyadınız"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="reg-email" className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
          E-posta
        </label>
        <input
          id="reg-email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
          placeholder="ornek@email.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
          Telefon <span className="text-[var(--text-disabled)] normal-case tracking-normal">(isteğe bağlı)</span>
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
          placeholder="+90 5XX XXX XX XX"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="reg-password" className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
          Şifre
        </label>
        <input
          id="reg-password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)]"
          placeholder="En az 8 karakter"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="h-11 w-full bg-[var(--text-primary)] text-xs font-medium tracking-[0.15em] uppercase text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Kaydediliyor..." : "Hesap Oluştur"}
      </button>
    </form>
  );
}
