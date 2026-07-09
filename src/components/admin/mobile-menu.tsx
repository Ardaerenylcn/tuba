"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ADMIN_NAV } from "./nav";

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden>
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

export function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const activeGroupIds = ADMIN_NAV
    .filter((g) => g.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/")))
    .map((g) => g.id);

  const [expanded, setExpanded] = useState<string[]>(
    activeGroupIds.length > 0 ? activeGroupIds : [ADMIN_NAV[0].id]
  );

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
    const newActive = ADMIN_NAV
      .filter((g) => g.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/")))
      .map((g) => g.id);
    if (newActive.length > 0) {
      setExpanded((prev) => [...new Set([...prev, ...newActive])]);
    }
  }, [pathname]);

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function toggle(id: string) {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <>
      {/* Hamburger button — only on mobile */}
      <button
        className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md hover:bg-[var(--bg-subtle)] transition-colors"
        onClick={() => setOpen(true)}
        aria-label="Menüyü aç"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[var(--text-primary)]" aria-hidden>
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-64 flex flex-col bg-[var(--surface)] border-r border-[var(--border)] shadow-xl transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4">
          <Link
            href="/"
            className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--text-primary)]"
            onClick={() => setOpen(false)}
          >
            Atölye Biz
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[var(--bg-subtle)] transition-colors"
            aria-label="Menüyü kapat"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[var(--text-muted)]" aria-hidden>
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          {ADMIN_NAV.map((group) => {
            const isExpanded = expanded.includes(group.id);
            const hasActive = group.items.some(
              (item) => pathname === item.href || pathname.startsWith(item.href + "/")
            );

            return (
              <div key={group.id}>
                <button
                  onClick={() => toggle(group.id)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors hover:bg-[var(--bg-subtle)] ${
                    hasActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                  }`}
                >
                  <span className="text-[13px] font-semibold">{group.label}</span>
                  <ChevronIcon
                    className={`transition-transform duration-200 text-[var(--text-muted)] ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {isExpanded && (
                  <div className="mt-0.5 mb-1 flex flex-col gap-0.5 pl-2">
                    {group.items.map((item) => {
                      const active =
                        pathname === item.href || pathname.startsWith(item.href + "/");
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex h-8 items-center rounded-md px-3 text-[13px] transition-colors ${
                            active
                              ? "bg-[var(--text-primary)] font-medium text-[var(--surface)]"
                              : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[var(--border)] p-3">
          <Link
            href="/"
            className="flex h-8 items-center rounded-md px-3 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors"
            onClick={() => setOpen(false)}
          >
            ← Siteye dön
          </Link>
        </div>
      </div>
    </>
  );
}
