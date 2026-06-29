"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as const;

interface Props {
  open: boolean;
  onClose: () => void;
}

const CARDS = [
  {
    href: "/atolyeler",
    type: "Atölye",
    title: "Tek günlük\nworkshoplar",
    description: "Gümüş, altın ve taş işleme tekniklerini küçük gruplarla öğrenin. Her seviyeye uygun.",
    cta: "Atölyeleri Keşfet",
    ringFrom: "#c8a86a",
    ringMid: "#e8d090",
  },
  {
    href: "/sertifikalar",
    type: "Sertifika",
    title: "Çok haftalı\nprogramlar",
    description: "Kuyumculukta ustalaşmak isteyenler için kapsamlı, sertifikalı eğitim programları.",
    cta: "Programları İncele",
    ringFrom: "#a89060",
    ringMid: "#d4b878",
  },
];

function Ring({ from, mid, delay = 0 }: { from: string; mid: string; delay?: number }) {
  return (
    <motion.div
      className="relative h-[80px] w-[80px]"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Breathing glow */}
      <motion.div
        className="absolute inset-[-6px] rounded-full blur-xl"
        style={{ background: `radial-gradient(circle, ${from}, transparent 65%)` }}
        animate={{ opacity: [0.2, 0.55, 0.2], scale: [1, 1.25, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Scale on card hover — CSS wrapper */}
      <div className="relative h-full w-full transition-transform duration-700 group-hover:scale-[1.15]">
        {/* Rotating metallic ring */}
        <motion.div
          className="h-full w-full rounded-full"
          style={{
            background: `conic-gradient(from 0deg, ${from}, ${mid}, #c8a050, ${mid}, ${from})`,
            padding: "12px",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        >
          {/* Inner dark hole */}
          <div className="h-full w-full rounded-full bg-[var(--color-stone-950)]" />
        </motion.div>
      </div>
    </motion.div>
  );
}

export function ReservationModal({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const modal = (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center px-5 py-10"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-[var(--color-stone-950)]/85 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="relative z-10 w-full max-w-2xl"
            initial={{ opacity: 0, y: 48, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.45, ease }}
          >
            {/* Header row */}
            <div className="mb-8 flex items-center justify-between px-1">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="text-[10px] font-medium tracking-[0.35em] uppercase text-[var(--color-stone-500)]"
              >
                Rezervasyon Yap
              </motion.p>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center text-[var(--color-stone-500)] transition-colors hover:text-[var(--color-stone-200)]"
                aria-label="Kapat"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
                </svg>
              </motion.button>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {CARDS.map((card, i) => (
                <motion.div
                  key={card.href}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ delay: 0.18 + i * 0.1, duration: 0.55, ease }}
                >
                  <Link
                    href={card.href}
                    onClick={onClose}
                    className="group relative flex min-h-[300px] flex-col justify-between overflow-hidden border border-[var(--color-stone-800)] bg-[var(--color-stone-950)] p-8 transition-all duration-500 hover:border-[var(--color-stone-600)]"
                  >
                    {/* Hover glow */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                      style={{ background: `radial-gradient(ellipse at 20% 80%, ${card.ringFrom}18, transparent 60%)` }}
                    />

                    {/* Ring */}
                    <div className="relative z-10">
                      <Ring from={card.ringFrom} mid={card.ringMid} delay={0.3 + i * 0.12} />
                    </div>

                    {/* Text */}
                    <div className="relative z-10 mt-10 flex flex-col gap-3">
                      <p
                        className="text-[10px] font-medium tracking-[0.25em] uppercase"
                        style={{ color: card.ringFrom }}
                      >
                        {card.type}
                      </p>
                      <h3 className="text-2xl font-light leading-snug text-[var(--color-stone-50)] whitespace-pre-line">
                        {card.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[var(--color-stone-500)]">
                        {card.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-[var(--color-stone-400)] transition-colors duration-300 group-hover:text-[var(--color-stone-100)]">
                        <span>{card.cta}</span>
                        <span className="transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden>→</span>
                      </div>
                    </div>

                    {/* Corner ring watermark */}
                    <div
                      className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full border-[12px] opacity-[0.07] transition-opacity duration-500 group-hover:opacity-[0.14]"
                      style={{ borderColor: card.ringFrom }}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Footer hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="mt-6 text-center text-[11px] text-[var(--color-stone-600)]"
            >
              Hangi program size uygun?{" "}
              <Link
                href="/iletisim"
                onClick={onClose}
                className="text-[var(--color-stone-400)] underline underline-offset-4 transition-colors hover:text-[var(--color-stone-200)]"
              >
                Bize yazın.
              </Link>
            </motion.p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
