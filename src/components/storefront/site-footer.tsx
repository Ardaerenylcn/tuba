import Link from "next/link";
import { db } from "@/lib/db";

interface Settings {
  siteName?: string;
  phone?: string;
  email?: string;
  address?: string;
  instagramUrl?: string;
  facebookUrl?: string;
}

async function getSettings(): Promise<Settings> {
  const row = await db.siteContent.findUnique({
    where: { key_locale: { key: "site.settings", locale: "tr" } },
  });
  if (!row?.value || typeof row.value !== "object" || Array.isArray(row.value)) return {};
  return row.value as Settings;
}

export async function SiteFooter() {
  const s = await getSettings();

  const siteName = s.siteName || "Atölye Biz";
  const phone = s.phone || null;
  const email = s.email || null;
  const address = s.address || null;
  const instagramUrl = s.instagramUrl || null;
  const facebookUrl = s.facebookUrl || null;

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--text-primary)]">
              {siteName}
            </span>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--text-secondary)]">
              Takı Tasarım Kursu · Kuyumculuk ve Mücevher Eğitimleri
            </p>
            {(instagramUrl || facebookUrl) && (
              <div className="flex items-center gap-4">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                  >
                    Instagram
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                  >
                    Facebook
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium tracking-[0.15em] uppercase text-[var(--text-muted)]">
              Keşfet
            </span>
            <nav className="flex flex-col gap-2" aria-label="Footer navigasyon">
              {[
                { href: "/atolyeler", label: "Atölyeler" },
                { href: "/sertifikalar", label: "Sertifika Programları" },
                { href: "/hakkimizda", label: "Hakkımızda" },
                { href: "/sss", label: "Sık Sorulan Sorular" },
                { href: "/iletisim", label: "İletişim" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium tracking-[0.15em] uppercase text-[var(--text-muted)]">
              İletişim
            </span>
            <div className="flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
              {phone && (
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="transition-colors hover:text-[var(--text-primary)]">
                  {phone}
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="transition-colors hover:text-[var(--text-primary)]">
                  {email}
                </a>
              )}
              {address && <span>{address}</span>}
              {!phone && !email && !address && (
                <span className="text-[var(--text-disabled)]">—</span>
              )}
            </div>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium tracking-[0.15em] uppercase text-[var(--text-muted)]">
              Yasal
            </span>
            <nav className="flex flex-col gap-2" aria-label="Yasal linkler">
              {[
                { href: "/yasal/gizlilik", label: "Gizlilik Politikası" },
                { href: "/yasal/iptal-iade", label: "İptal ve İade" },
                { href: "/yasal/mesafeli-satis", label: "Mesafeli Satış Sözleşmesi" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} {siteName}. Tüm hakları saklıdır.
          </p>
          <p className="text-xs text-[var(--text-disabled)]">
            El işçiliğinin yaşatıldığı bir alan.
          </p>
        </div>
      </div>
    </footer>
  );
}
