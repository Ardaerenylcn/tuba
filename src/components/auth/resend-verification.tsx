"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type State = "idle" | "loading" | "sent" | "error";

/**
 * Doğrulama e-postasını yeniden gönderir.
 * `email` verilirse yalnızca buton, verilmezse e-posta alanı + buton gösterilir.
 */
export function ResendVerification({ email: knownEmail }: { email?: string }) {
  const [email, setEmail] = useState(knownEmail ?? "");
  const [state, setState] = useState<State>("idle");

  async function send() {
    if (!email) return;
    setState("loading");

    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/eposta-dogrula",
    });

    setState(error ? "error" : "sent");
  }

  if (state === "sent") {
    return (
      <p className="text-sm leading-relaxed text-[var(--text-muted)]">
        Doğrulama bağlantısı{" "}
        <span className="text-[var(--text-primary)]">{email}</span> adresine tekrar gönderildi.
        Gelen kutunuzu ve spam klasörünüzü kontrol edin.
      </p>
    );
  }

  return (
    // Giriş formunun içine de yerleştirildiği için <form> değil <div> kullanılıyor.
    <div className="flex flex-col gap-3">
      {!knownEmail && (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="resend-email"
            className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]"
          >
            E-posta
          </label>
          <input
            id="resend-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void send();
              }
            }}
            disabled={state === "loading"}
            className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)] disabled:opacity-50"
            placeholder="ornek@email.com"
          />
        </div>
      )}

      {state === "error" && (
        <p role="alert" className="text-sm text-red-600">
          Bağlantı gönderilemedi. Lütfen tekrar deneyin.
        </p>
      )}

      <button
        type="button"
        onClick={send}
        disabled={state === "loading" || !email}
        className="h-11 w-full border border-[var(--text-primary)] text-xs font-medium tracking-[0.15em] uppercase text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-subtle)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state === "loading" ? "Gönderiliyor…" : "Doğrulama Bağlantısını Yeniden Gönder"}
      </button>
    </div>
  );
}
