"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type State = "idle" | "loading" | "sent" | "error";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    setErrorMsg("");

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/sifre-sifirla",
    });

    if (error) {
      setState("error");
      setErrorMsg("Bir hata oluştu. Lütfen tekrar deneyin.");
      return;
    }

    setState("sent");
  }

  if (state === "sent") {
    return (
      <div className="border border-[var(--border)] bg-[var(--bg-subtle)] p-6 text-center">
        <p className="mb-1 text-sm font-medium text-[var(--text-primary)]">E-posta gönderildi</p>
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          <span className="text-[var(--text-primary)]">{email}</span> adresine sıfırlama
          bağlantısı gönderdik. Gelen kutunuzu kontrol edin.
        </p>
        <p className="mt-3 text-xs text-[var(--text-disabled)]">
          Görünmüyorsa spam klasörüne bakın. Bağlantı 1 saat geçerlidir.
        </p>
      </div>
    );
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
          disabled={state === "loading"}
          className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)] disabled:opacity-50"
          placeholder="ornek@email.com"
        />
      </div>

      {state === "error" && (
        <p role="alert" className="text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={state === "loading" || !email}
        className="h-11 w-full bg-[var(--text-primary)] text-xs font-medium tracking-[0.15em] uppercase text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state === "loading" ? "Gönderiliyor…" : "Sıfırlama Bağlantısı Gönder"}
      </button>
    </form>
  );
}
