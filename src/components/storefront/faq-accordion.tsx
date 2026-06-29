"use client";

import { useState } from "react";

interface FAQItem {
  q: string;
  a: string;
}

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex flex-col divide-y divide-[var(--border)]">
      {items.map((item, i) => (
        <div key={i}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-start justify-between gap-4 py-5 text-left"
            aria-expanded={open === i}
          >
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {item.q}
            </span>
            <span
              className={`mt-0.5 shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${
                open === i ? "rotate-45" : ""
              }`}
              aria-hidden
            >
              +
            </span>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              open === i ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              {item.a}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
