"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PageHero({ eyebrow, title, description }: Props) {
  return (
    <section className="bg-[var(--color-stone-950)] px-6 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl">
        {eyebrow && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="mb-5 text-[10px] font-medium tracking-[0.35em] uppercase text-[var(--color-stone-500)]"
          >
            {eyebrow}
          </motion.p>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.12, ease }}
          className="text-4xl font-light tracking-tight text-[var(--color-stone-50)] sm:text-5xl lg:text-6xl"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.28, ease }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-stone-400)]"
          >
            {description}
          </motion.p>
        )}
      </div>
    </section>
  );
}
