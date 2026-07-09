"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { ReservationModal } from "./reservation-modal";
import type { AnnouncementBarConfig } from "@/lib/site-content";

const NAV_LINKS = [
  { href: "/", label: "Anasayfa" },
  {
    href: "/koleksiyonlar",
    label: "Koleksiyonlar",
    children: [
      { href: "/koleksiyonlar/kolyeler", label: "Kolyeler" },
      { href: "/koleksiyonlar/yuzukler", label: "Yüzükler" },
      { href: "/koleksiyonlar/kupeler", label: "Küpeler" },
      { href: "/koleksiyonlar/bileklikler", label: "Bileklikler" },
      { href: "/koleksiyonlar/charmlar", label: "Charm'lar" },
    ],
  },
  { href: "/programlar", label: "Atölye Biz" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

export function SiteHeader({ announcement }: { announcement?: AnnouncementBarConfig }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const openModal = useCallback(() => { setMenuOpen(false); setModalOpen(true); }, []);
  const closeModal = useCallback(() => setModalOpen(false), []);
  const { data: session } = useSession();
  const user = session?.user as (NonNullable<typeof session>["user"] & { role: string }) | undefined;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Announcement bar */}
        {(announcement?.visible ?? true) && (
          <div className="bg-[var(--bg-subtle)] border-b border-[var(--border)] h-10 flex items-center justify-center px-4">
            <span className="text-[11px] tracking-[0.15em] text-[var(--text-secondary)]">
              {announcement?.text ?? "Ücretsiz kargo tüm siparişlerde"}&nbsp;&nbsp;|&nbsp;&nbsp;
              <svg className="inline-block w-3 h-3 mb-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2L14.4 9.2H22L16 13.8L18.4 21L12 16.4L5.6 21L8 13.8L2 9.2H9.6L12 2Z" />
              </svg>
            </span>
          </div>
        )}

        {/* Main nav */}
        <div
          className={`bg-[var(--bg)] border-b border-[var(--border)] transition-shadow duration-200 ${
            scrolled ? "shadow-[0_2px_12px_rgba(44,24,16,0.08)]" : ""
          }`}
        >
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            {/* Logo */}
            <Link href="/" className="flex flex-col leading-none select-none group">
              <span
                className="text-[15px] tracking-[0.04em] text-[var(--text-primary)] group-hover:text-[var(--text-secondary)] transition-colors"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 500 }}
              >
                tuba atman
              </span>
              <span
                className="text-[11px] tracking-[0.22em] uppercase text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                jewelry
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-7 md:flex" aria-label="Ana menü">
              {NAV_LINKS.map((link) =>
                link.children ? (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <button className="flex items-center gap-1 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1">
                      {link.label}
                      <svg className="w-3 h-3 mt-px" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                        <path d="M2 4l4 4 4-4" />
                      </svg>
                    </button>
                    {dropdownOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 min-w-[160px] bg-[var(--surface)] border border-[var(--border)] shadow-md py-2 z-10">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <button className="hidden md:flex text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" aria-label="Ara">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <circle cx="11" cy="11" r="7" /><path d="M16.5 16.5l4 4" />
                </svg>
              </button>

              {/* Account */}
              {user ? (
                <div className="hidden md:flex items-center gap-3">
                  {(user.role === "admin" || user.role === "editor") && (
                    <Link href="/admin/dashboard" className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                      Admin
                    </Link>
                  )}
                  <Link href="/hesabim" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" aria-label="Hesabım">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/giris"; } } })}
                    className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Çıkış
                  </button>
                </div>
              ) : (
                <Link href="/giris" className="hidden md:flex text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" aria-label="Giriş Yap">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </Link>
              )}

              {/* Wishlist */}
              <button className="hidden md:flex text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" aria-label="Favoriler">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <path d="M12 21C12 21 3 13.5 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-9 13-9 13z" />
                </svg>
              </button>

              {/* Cart */}
              <button onClick={openModal} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" aria-label="Rezervasyon">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </button>

              {/* Mobile hamburger */}
              <button
                className="flex flex-col items-center justify-center gap-1.5 p-1 md:hidden"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Menüyü aç"
                aria-expanded={menuOpen}
              >
                <span className={`block h-px w-5 bg-[var(--text-primary)] transition-all duration-200 ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
                <span className={`block h-px w-5 bg-[var(--text-primary)] transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`block h-px w-5 bg-[var(--text-primary)] transition-all duration-200 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-b border-[var(--border)] bg-[var(--bg)] px-6 pb-6 pt-4 md:hidden">
            <nav className="flex flex-col gap-4" aria-label="Mobil menü">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-[var(--border)]" />
              {user ? (
                <>
                  <Link href="/hesabim" className="text-sm text-[var(--text-secondary)]" onClick={() => setMenuOpen(false)}>
                    {user.name}
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/giris"; } } }); }}
                    className="text-left text-sm text-[var(--text-secondary)]"
                  >
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <Link href="/giris" className="text-sm text-[var(--text-secondary)]" onClick={() => setMenuOpen(false)}>
                  Giriş Yap
                </Link>
              )}
              <button
                onClick={openModal}
                className="inline-flex h-10 items-center justify-center bg-[var(--text-primary)] px-5 text-[11px] font-medium tracking-[0.12em] uppercase text-[var(--surface)]"
              >
                Rezervasyon Yap
              </button>
            </nav>
          </div>
        )}
      </header>

      <ReservationModal open={modalOpen} onClose={closeModal} />
    </>
  );
}
