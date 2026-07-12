"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ADMIN_NAV } from "./nav";

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" width="12" height="12" aria-hidden>
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpanded((prev) => [...new Set([...prev, ...newActive])]);
    }
  }, [pathname]);

  function toggle(id: string) {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-[var(--admin-rail)] text-slate-300 lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-white/5 px-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--admin-rail-accent)] text-[13px] font-bold text-[#0f172a]">T</span>
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-semibold text-white">Tuba Atman</span>
          <span className="text-[10px] tracking-[0.15em] uppercase text-slate-500">Yönetim Paneli</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Admin menü">
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
                <div className="mb-1 mt-0.5 flex flex-col gap-0.5">
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
                        {active && (
                          <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r bg-[var(--admin-rail-accent)]" />
                        )}
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
          className="flex h-9 items-center gap-2 rounded-md px-3 text-xs text-slate-400 transition-colors hover:bg-[var(--admin-rail-hover)] hover:text-white"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
          </svg>
          Siteye dön
        </Link>
      </div>
    </aside>
  );
}
