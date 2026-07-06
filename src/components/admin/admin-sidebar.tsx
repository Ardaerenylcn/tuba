"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    label: "Genel",
    items: [
      { href: "/admin/dashboard", label: "Dashboard" },
    ],
  },
  {
    label: "İçerik",
    items: [
      { href: "/admin/programlar", label: "Programlar" },
      { href: "/admin/turler", label: "Program Türleri" },
      { href: "/admin/oturumlar", label: "Oturumlar" },
      { href: "/admin/galeri", label: "Galeri" },
    ],
  },
  {
    label: "Operasyon",
    items: [
      { href: "/admin/rezervasyonlar", label: "Rezervasyonlar" },
      { href: "/admin/musteriler", label: "Müşteriler" },
      { href: "/admin/odemeler", label: "Ödemeler" },
      { href: "/admin/indirim-kodlari", label: "İndirim Kodları" },
    ],
  },
  {
    label: "Site",
    items: [
      { href: "/admin/site", label: "Site İçeriği" },
      { href: "/admin/banner", label: "Giriş Bannerı" },
      { href: "/admin/medya", label: "Medya" },
      { href: "/admin/kullanicilar", label: "Kullanıcılar" },
      { href: "/admin/audit-log", label: "Audit Log" },
      { href: "/admin/ayarlar", label: "Ayarlar" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] lg:flex">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-[var(--border)] px-5">
        <Link
          href="/"
          className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--text-primary)]"
        >
          Atölye Biz
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-5" aria-label="Admin menü">
        {NAV.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-2 text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--text-disabled)]">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex h-8 items-center rounded-sm px-2 text-sm transition-colors ${
                      active
                        ? "bg-[var(--bg-subtle)] font-medium text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--border)] p-4">
        <Link
          href="/"
          className="flex h-8 items-center px-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          ← Siteye dön
        </Link>
      </div>
    </aside>
  );
}
