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

export function AdminSidebar() {
  const pathname = usePathname();

  const activeGroupIds = ADMIN_NAV
    .filter((g) => g.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/")))
    .map((g) => g.id);

  const [expanded, setExpanded] = useState<string[]>(
    activeGroupIds.length > 0 ? activeGroupIds : [ADMIN_NAV[0].id]
  );

  useEffect(() => {
    const newActive = ADMIN_NAV
      .filter((g) => g.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/")))
      .map((g) => g.id);
    if (newActive.length > 0) {
      setExpanded((prev) => [...new Set([...prev, ...newActive])]);
    }
  }, [pathname]);

  function toggle(id: string) {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] lg:flex">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-[var(--border)] px-4">
        <Link
          href="/"
          className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--text-primary)]"
        >
          Atölye Biz
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3" aria-label="Admin menü">
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
        >
          ← Siteye dön
        </Link>
      </div>
    </aside>
  );
}
