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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        className={`fixed top-0 left-0 z-50 h-full w-64 flex flex-col bg-[var(--admin-rail)] text-slate-300 shadow-xl transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex h-16 items-center justify-between border-b border-white/5 px-5">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--admin-rail-accent)] text-[13px] font-bold text-[#0f172a]">T</span>
            <span className="text-[13px] font-semibold text-white">Tuba Atman</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Menüyü kapat"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden>
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {ADMIN_NAV.map((group) => {
            const isExpanded = expanded.includes(group.id);
            return (
              <div key={group.id} className="flex flex-col">
                <button
                  onClick={() => toggle(group.id)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 transition-colors hover:text-slate-300"
                >
                  <span>{group.label}</span>
                  <ChevronIcon className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                {isExpanded && (
                  <div className="mt-0.5 mb-1 flex flex-col gap-0.5">
                    {group.items.map((item) => {
                      const active = pathname === item.href || pathname.startsWith(item.href + "/");
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={`relative flex h-9 items-center rounded-md pl-4 pr-3 text-[13px] transition-colors ${
                            active
                              ? "bg-[var(--admin-rail-active)] font-medium text-white"
                              : "text-slate-400 hover:bg-[var(--admin-rail-hover)] hover:text-white"
                          }`}
                        >
                          {active && <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r bg-[var(--admin-rail-accent)]" />}
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
        <div className="border-t border-white/5 p-3">
          <Link
            href="/"
            className="flex h-9 items-center rounded-md px-3 text-xs text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            onClick={() => setOpen(false)}
          >
            ← Siteye dön
          </Link>
        </div>
      </div>
    </>
  );
}
