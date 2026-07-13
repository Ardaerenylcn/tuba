"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FavoriteButton({
  programId,
  initialFavorited,
  isLoggedIn,
  variant = "icon",
}: {
  programId: string;
  initialFavorited: boolean;
  isLoggedIn: boolean;
  variant?: "icon" | "labeled";
}) {
  const router = useRouter();
  const [fav, setFav] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!isLoggedIn) { router.push("/giris?redirect=" + encodeURIComponent(location.pathname)); return; }
    const prev = fav;
    setFav(!fav); // iyimser
    setLoading(true);
    try {
      const res = await fetch("/api/v1/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId }),
      });
      const data = await res.json();
      if (!data.success) { setFav(prev); return; }
      setFav(Boolean(data.data.favorited));
    } catch {
      setFav(prev);
    } finally {
      setLoading(false);
    }
  }

  const heart = (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 21C12 21 3 13.5 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-9 13-9 13z" />
    </svg>
  );

  if (variant === "labeled") {
    return (
      <button onClick={toggle} disabled={loading}
        className={`inline-flex h-11 items-center gap-2 border px-5 text-xs font-medium uppercase tracking-[0.1em] transition-colors disabled:opacity-50 ${
          fav ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border-strong)] text-[var(--text-primary)] hover:border-[var(--text-primary)]"
        }`}
        aria-pressed={fav}>
        {heart}
        {fav ? "Favorilerde" : "Favorilere Ekle"}
      </button>
    );
  }

  return (
    <button onClick={toggle} disabled={loading}
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors disabled:opacity-50 ${
        fav ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]" : "border-[var(--border)] bg-[var(--surface)]/80 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      }`}
      aria-label={fav ? "Favorilerden çıkar" : "Favorilere ekle"} aria-pressed={fav}>
      {heart}
    </button>
  );
}
