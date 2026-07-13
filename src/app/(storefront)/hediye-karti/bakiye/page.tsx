"use client";

import { useState } from "react";
import Link from "next/link";

interface Result {
  code: string;
  balance: number;
  applicable: number;
  expiresAt: string;
}

const serif = { fontFamily: "var(--font-cormorant), Georgia, serif" } as const;

export default function GiftCardBalancePage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/v1/gift-cards/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!data.success) setError(data.message ?? "Kart doğrulanamadı.");
      else setResult(data.data as Result);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-20">
      <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--text-muted)]">Hediye Kartı</p>
      <h1 className="mb-3 text-center text-[clamp(2rem,5vw,3rem)] font-light leading-tight tracking-tight text-[var(--text-primary)]" style={serif}>
        Bakiye Sorgula
      </h1>
      <p className="mx-auto mb-10 max-w-sm text-center text-sm leading-relaxed text-[var(--text-secondary)]">
        Hediye kartı kodunuzu girin, güncel bakiyenizi ve geçerlilik tarihini görün.
      </p>

      <form onSubmit={check} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ÖRN: TUBA-XXXX-XXXX"
          className="h-12 flex-1 border border-[var(--border)] bg-[var(--bg)] px-4 text-sm tracking-wider text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
          aria-label="Hediye kartı kodu"
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="h-12 bg-[var(--text-primary)] px-6 text-[12px] font-semibold uppercase tracking-[0.15em] text-[var(--surface)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          {loading ? "Sorgulanıyor..." : "Sorgula"}
        </button>
      </form>

      {error && (
        <div className="mt-6 border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">{error}</div>
      )}

      {result && (
        <div className="mt-6 border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">{result.code}</p>
          <p className="my-3 text-4xl font-light text-[var(--text-primary)]" style={serif}>
            {result.balance.toLocaleString("tr-TR")} ₺
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Son geçerlilik: {new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(result.expiresAt))}
          </p>
        </div>
      )}

      <div className="mt-10 text-center">
        <Link href="/hediye-karti" className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--accent)] hover:text-[var(--accent-hover)]">
          ← Hediye kartı satın al
        </Link>
      </div>
    </div>
  );
}
