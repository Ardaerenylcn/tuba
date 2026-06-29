"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  name: string;
  phone: string | null;
}

export function ProfileForm({ name, phone }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    const res = await fetch("/api/v1/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, phone: data.phone || null }),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Bir hata oluştu.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[var(--text-secondary)]" htmlFor="p-name">
          Ad Soyad
        </label>
        <input
          id="p-name"
          name="name"
          type="text"
          defaultValue={name}
          required
          minLength={2}
          className="h-10 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[var(--text-secondary)]" htmlFor="p-phone">
          Telefon
        </label>
        <input
          id="p-phone"
          name="phone"
          type="tel"
          defaultValue={phone ?? ""}
          placeholder="+90 5xx xxx xx xx"
          className="h-10 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {success && <p className="text-xs text-green-700">Profil güncellendi.</p>}

      <button
        type="submit"
        disabled={loading}
        className="h-9 self-start bg-[var(--text-primary)] px-6 text-xs font-medium tracking-[0.1em] uppercase text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)] disabled:opacity-60"
      >
        {loading ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}
