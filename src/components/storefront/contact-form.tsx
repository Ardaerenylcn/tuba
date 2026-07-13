"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Bir hata oluştu.");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center border border-[var(--border)] px-8">
        <p className="text-2xl font-light text-[var(--text-primary)]">Mesajınız alındı.</p>
        <p className="text-sm text-[var(--text-secondary)]">
          En kısa sürede size geri döneceğiz.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-xs text-[var(--text-muted)] underline underline-offset-4"
        >
          Yeni mesaj gönder
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)]" htmlFor="name">
            Ad Soyad <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            minLength={2}
            placeholder="Adınız Soyadınız"
            className="h-10 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)]" htmlFor="phone">
            Telefon
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+90 5xx xxx xx xx"
            className="h-10 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[var(--text-secondary)]" htmlFor="email">
          E-posta <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="ornek@email.com"
          className="h-10 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[var(--text-secondary)]" htmlFor="subject">
          Konu
        </label>
        <select
          id="subject"
          name="subject"
          defaultValue=""
          className="h-10 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
        >
          <option value="" disabled>Konu seçin</option>
          <option value="rezervasyon">Rezervasyon bilgisi</option>
          <option value="program">Program içeriği</option>
          <option value="ozel">Özel etkinlik / kurumsal</option>
          <option value="diger">Diğer</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[var(--text-secondary)]" htmlFor="message">
          Mesaj <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Mesajınızı yazın..."
          className="resize-none border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
        />
      </div>

      {status === "error" && error && (
        <p role="alert" className="text-xs text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="h-11 bg-[var(--text-primary)] px-8 text-xs font-medium tracking-[0.15em] uppercase text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)] disabled:opacity-60 disabled:cursor-not-allowed self-start"
      >
        {status === "loading" ? "Gönderiliyor..." : "Gönder"}
      </button>
    </form>
  );
}
