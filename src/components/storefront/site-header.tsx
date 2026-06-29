"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { ReservationModal } from "./reservation-modal";

const NAV_LINKS = [
  { href: "/atolyeler", label: "Atölyeler" },
  { href: "/sertifikalar", label: "Sertifikalar" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/galeri", label: "Galeri" },
  { href: "/iletisim", label: "İletişim" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = useCallback(() => { setMenuOpen(false); setModalOpen(true); }, []);
  const closeModal = useCallback(() => setModalOpen(false), []);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as (NonNullable<typeof session>["user"] & { role: string }) | undefined;

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className={`text-sm font-semibold tracking-[0.2em] uppercase transition-colors ${
            transparent ? "text-[var(--color-stone-100)]" : "text-[var(--text-primary)]"
          }`}
        >
          Atölye Biz
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Ana menü">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                transparent
                  ? "text-[var(--color-stone-400)] hover:text-[var(--color-stone-100)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              {(user.role === "admin" || user.role === "editor") && (
                <Link
                  href="/admin/dashboard"
                  className={`text-sm transition-colors ${
                    transparent
                      ? "text-[var(--color-stone-400)] hover:text-[var(--color-stone-100)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Admin
                </Link>
              )}
              <Link
                href="/hesabim"
                className={`text-sm transition-colors ${
                  transparent
                    ? "text-[var(--color-stone-400)] hover:text-[var(--color-stone-100)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {user.name}
              </Link>
              <button
                onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/giris"; } } })}
                className={`text-sm transition-colors ${
                  transparent
                    ? "text-[var(--color-stone-400)] hover:text-[var(--color-stone-100)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Çıkış
              </button>
            </>
          ) : (
            <Link
              href="/giris"
              className={`text-sm transition-colors ${
                transparent
                  ? "text-[var(--color-stone-400)] hover:text-[var(--color-stone-100)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Giriş Yap
            </Link>
          )}
          <button
            onClick={openModal}
            className={`inline-flex h-9 items-center justify-center border px-5 text-xs font-medium tracking-[0.1em] uppercase transition-colors ${
              transparent
                ? "border-[var(--color-stone-600)] text-[var(--color-stone-300)] hover:border-[var(--color-stone-400)] hover:text-[var(--color-stone-100)]"
                : "border-[var(--text-primary)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--surface)]"
            }`}
          >
            Rezervasyon
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="flex flex-col items-center justify-center gap-1.5 p-2 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menüyü aç"
          aria-expanded={menuOpen}
        >
          <span
            className={`block h-px w-6 transition-all duration-200 ${
              transparent ? "bg-[var(--color-stone-300)]" : "bg-[var(--text-primary)]"
            } ${menuOpen ? "translate-y-2.5 rotate-45" : ""}`}
          />
          <span
            className={`block h-px w-6 transition-all duration-200 ${
              transparent ? "bg-[var(--color-stone-300)]" : "bg-[var(--text-primary)]"
            } ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-px w-6 transition-all duration-200 ${
              transparent ? "bg-[var(--color-stone-300)]" : "bg-[var(--text-primary)]"
            } ${menuOpen ? "-translate-y-2.5 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className={`border-t px-6 pb-6 pt-4 md:hidden ${
            transparent
              ? "border-[var(--color-stone-800)] bg-[var(--color-stone-950)]/95 backdrop-blur-sm"
              : "border-[var(--border)] bg-[var(--surface)]"
          }`}
        >
          <nav className="flex flex-col gap-4" aria-label="Mobil menü">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm ${
                  transparent ? "text-[var(--color-stone-400)]" : "text-[var(--text-secondary)]"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr
              className={
                transparent ? "border-[var(--color-stone-800)]" : "border-[var(--border)]"
              }
            />
            {user ? (
              <>
                {(user.role === "admin" || user.role === "editor") && (
                  <Link
                    href="/admin/dashboard"
                    className={`text-sm ${
                      transparent ? "text-[var(--color-stone-400)]" : "text-[var(--text-secondary)]"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  href="/hesabim"
                  className={`text-sm ${
                    transparent ? "text-[var(--color-stone-400)]" : "text-[var(--text-secondary)]"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {user.name}
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/giris"; } } }); }}
                  className={`text-left text-sm ${
                    transparent ? "text-[var(--color-stone-400)]" : "text-[var(--text-secondary)]"
                  }`}
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <Link
                href="/giris"
                className={`text-sm ${
                  transparent ? "text-[var(--color-stone-400)]" : "text-[var(--text-secondary)]"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                Giriş Yap
              </Link>
            )}
            <button
              onClick={openModal}
              className={`inline-flex h-10 items-center justify-center border px-5 text-xs font-medium tracking-[0.1em] uppercase ${
                transparent
                  ? "border-[var(--color-stone-600)] text-[var(--color-stone-300)]"
                  : "border-[var(--text-primary)] text-[var(--text-primary)]"
              }`}
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
