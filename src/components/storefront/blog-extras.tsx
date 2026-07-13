"use client";

import { useEffect, useState } from "react";

/** Sayfa kaydırma ilerlemesini üstte ince bir çubukla gösterir. */
export function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setPct(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed left-0 top-0 z-[60] h-0.5 w-full bg-transparent" aria-hidden>
      <div className="h-full bg-[var(--accent)] transition-[width] duration-150 ease-out" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** WhatsApp / X paylaşım + bağlantı kopyalama. */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const wa = `https://wa.me/?text=${enc(`${title} ${url}`)}`;
  const x = `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* pano erişimi yoksa sessiz geç */
    }
  }

  const btn = "inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--border)] px-3.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs text-[var(--text-muted)]">Paylaş:</span>
      <a href={wa} target="_blank" rel="noopener noreferrer" className={btn} aria-label="WhatsApp'ta paylaş">WhatsApp</a>
      <a href={x} target="_blank" rel="noopener noreferrer" className={btn} aria-label="X'te paylaş">X</a>
      <button type="button" onClick={copy} className={btn} aria-label="Bağlantıyı kopyala">
        {copied ? "Kopyalandı ✓" : "Bağlantıyı kopyala"}
      </button>
    </div>
  );
}
