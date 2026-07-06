"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "tuba-banner-dismissed";

export function EntryBanner() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Kısa gecikme sonrası aç; localStorage'da kapalı işareti yoksa göster
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function close() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(close, 2000);
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[100] bg-[var(--text-primary)]/40 backdrop-blur-[2px]"
            onClick={close}
            aria-hidden
          />

          {/* Modal */}
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Hoş geldiniz"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-lg bg-[var(--bg)] border border-[var(--border)] shadow-[0_24px_80px_rgba(44,24,16,0.18)]">
              {/* Kapat */}
              <button
                onClick={close}
                aria-label="Kapat"
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" aria-hidden>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2">
                {/* Sol — dekoratif */}
                <div
                  className="hidden sm:flex flex-col items-center justify-center p-10 border-r border-[var(--border)]"
                  style={{ background: "var(--bg-subtle)" }}
                >
                  {/* Dekoratif halka çizimi */}
                  <svg viewBox="0 0 120 120" className="w-28 h-28 text-[var(--text-primary)] opacity-70" aria-hidden>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" />
                    <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" />
                    <circle cx="60" cy="60" r="18" fill="none" stroke="currentColor" strokeWidth="4" />
                    <circle cx="60" cy="10" r="5" fill="currentColor" />
                  </svg>
                  <p
                    className="mt-6 text-center text-[13px] leading-snug text-[var(--text-secondary)]"
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontStyle: "italic", fontSize: "17px" }}
                  >
                    &ldquo;Takının gücü,<br />onu yapan ellerde gizlidir.&rdquo;
                  </p>
                </div>

                {/* Sağ — içerik */}
                <div className="flex flex-col p-8">
                  <div className="mb-6">
                    <p className="mb-1 text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)]">
                      Hoş Geldiniz
                    </p>
                    <h2
                      className="mb-3 text-[26px] leading-tight text-[var(--text-primary)]"
                      style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 600 }}
                    >
                      İlk Siparişinize<br />%10 İndirim
                    </h2>
                    <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">
                      E-posta listemize katılın, yeni koleksiyonları ve atölye
                      duyurularını kaçırmayın.
                    </p>
                  </div>

                  {submitted ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center gap-3 py-6 text-center"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-[var(--text-primary)]" aria-hidden>
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <p className="text-[13px] font-medium text-[var(--text-primary)]">Teşekkürler!</p>
                      <p className="text-[11px] text-[var(--text-muted)]">İndirim kodunuz e-posta ile gönderildi.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                      <input
                        type="email"
                        required
                        placeholder="E-posta adresiniz"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] outline-none focus:border-[var(--text-primary)] transition-colors"
                      />
                      <button
                        type="submit"
                        className="h-11 bg-[var(--text-primary)] text-[11px] font-medium tracking-[0.15em] uppercase text-[var(--surface)] hover:opacity-80 transition-opacity"
                      >
                        %10 İndirimi Al
                      </button>
                    </form>
                  )}

                  <button
                    onClick={close}
                    className="mt-4 text-center text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors underline underline-offset-2"
                  >
                    Hayır teşekkürler, devam et
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
