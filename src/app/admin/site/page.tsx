"use client";

import Link from "next/link";

const SECTIONS = [
  {
    href: "/admin/site/duyuru",
    label: "Duyuru Çubuğu",
    desc: "Üst kısımdaki kargo / kampanya duyurusu",
  },
  {
    href: "/admin/site/atolye-biz",
    label: "Atölye Biz Bölümü",
    desc: "Başlık, açıklama, kart görselleri ve başlıkları",
  },
  {
    href: "/admin/site/guven-rozetleri",
    label: "Güven Rozetleri",
    desc: "Kargo, el yapımı, iade ve güvenli ödeme rozetleri",
  },
  {
    href: "/admin/site/bulten",
    label: "Bülten & Sosyal Medya",
    desc: "Bülten başlığı, sosyal medya linkleri",
  },
  {
    href: "/admin/site/iletisim-bilgileri",
    label: "İletişim Bilgileri",
    desc: "Telefon, WhatsApp, Instagram, konum ve çalışma saatleri",
  },
  {
    href: "/admin/site/hakkimizda",
    label: "Hakkımızda Sayfası",
    desc: "Hero, alıntı, hikaye, istatistikler, değerler ve CTA bölümleri",
  },
];

export default function SitePage() {
  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Site İçeriği</h1>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          Sitenin görünür bölümlerini buradan düzenleyin.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex flex-col gap-1 border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--text-primary)]"
          >
            <p className="text-[13px] font-medium text-[var(--text-primary)] group-hover:text-[var(--text-secondary)] transition-colors">
              {s.label}
            </p>
            <p className="text-[12px] text-[var(--text-muted)]">{s.desc}</p>
            <p className="mt-2 text-[11px] text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
              Düzenle →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
