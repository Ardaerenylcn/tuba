import Link from "next/link";
import { db } from "@/lib/db";

interface Settings {
  siteName?: string;
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
  const instagramUrl = s.instagramUrl || "#";
  const facebookUrl = s.facebookUrl || "#";
  void facebookUrl;

  const columns = [
    {
      title: "Alışveriş",
      links: [
        { href: "/koleksiyonlar", label: "Koleksiyonlar" },
        { href: "/koleksiyonlar/yeni", label: "Yeni Ürünler" },
        { href: "/koleksiyonlar/populer", label: "En Çok Tercih Edilenler" },
        { href: "/hediye-karti", label: "Hediye Kartı" },
      ],
    },
    {
      title: "Atölye Biz",
      links: [
        { href: "/atolyeler/jewelry-courses", label: "Jewelry Courses" },
        { href: "/atolyeler/wax-carving", label: "Wax Carving Workshops" },
        { href: "/atolyeler/private-lessons", label: "Private Lessons" },
        { href: "/atolyeler", label: "Atölye Takvimi" },
      ],
    },
    {
      title: "Kurumsal",
      links: [
        { href: "/hakkimizda", label: "Hakkımızda" },
        { href: "/hakkimizda#magazamiz", label: "Mağazamız" },
        { href: "/yasal/kargo", label: "Kargo & Teslimat" },
        { href: "/yasal/iptal-iade", label: "İade & Değişim" },
      ],
    },
    {
      title: "Yardım",
      links: [
        { href: "/sss", label: "SSS" },
        { href: "/yasal/kullanim-kosullari", label: "Kullanım Koşulları" },
        { href: "/yasal/gizlilik", label: "Gizlilik Politikası" },
        { href: "/iletisim", label: "İletişim" },
      ],
    },
  ];

  return (
    <footer className="bg-[var(--bg-subtle)] border-t border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div>
              <p
                className="text-[17px] text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 500 }}
              >
                tuba atman
              </p>
              <p
                className="text-[11px] tracking-[0.22em] uppercase text-[var(--text-muted)]"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                jewelry
              </p>
            </div>
            <p className="text-[12px] leading-relaxed text-[var(--text-secondary)] max-w-[200px]">
              Çağdaş takı tasarımı, el işçiliği ve İstanbul&apos;daki yaratıcı
              atölye deneyimleri.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--text-primary)]">
                {col.title}
              </span>
              <nav className="flex flex-col gap-2" aria-label={col.title}>
                {col.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--border)] bg-[var(--bg)]">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[var(--text-muted)]">
            © {new Date().getFullYear()} Tuba Atman Jewelry. Tüm hakları saklıdır.
          </p>

          {/* Payment icons */}
          <div className="flex items-center gap-3">
            {/* VISA */}
            <svg className="h-6 w-auto text-[var(--text-muted)]" viewBox="0 0 50 16" aria-label="Visa">
              <text y="13" fontSize="13" fontWeight="700" fontFamily="Arial, sans-serif" fill="currentColor">VISA</text>
            </svg>
            {/* Mastercard */}
            <svg className="h-5 w-auto" viewBox="0 0 38 24" aria-label="Mastercard">
              <circle cx="13" cy="12" r="10" fill="#eb001b" opacity="0.8" />
              <circle cx="25" cy="12" r="10" fill="#f79e1b" opacity="0.8" />
              <path d="M19 5.5a10 10 0 010 13" fill="#ff5f00" opacity="0.8" />
            </svg>
            {/* Amex-style */}
            <svg className="h-5 w-auto" viewBox="0 0 50 30" aria-label="Ödeme">
              <rect width="50" height="30" rx="4" fill="#2566af" />
              <text x="5" y="21" fontSize="14" fontWeight="700" fontFamily="Arial, sans-serif" fill="white">AMEX</text>
            </svg>
            {/* Apple Pay */}
            <svg className="h-5 w-auto text-[var(--text-primary)]" viewBox="0 0 60 24" aria-label="Apple Pay">
              <text y="18" fontSize="12" fontFamily="Arial, sans-serif" fill="currentColor">Apple Pay</text>
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}
