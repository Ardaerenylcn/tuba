export const ADMIN_NAV = [
  {
    id: "genel",
    label: "Genel",
    items: [
      { href: "/admin/dashboard", label: "Dashboard" },
    ],
  },
  {
    id: "katalog",
    label: "Katalog",
    items: [
      { href: "/admin/takvim", label: "Takvim" },
      { href: "/admin/programlar", label: "Programlar" },
      { href: "/admin/turler", label: "Kategoriler" },
      { href: "/admin/oturumlar", label: "Oturumlar" },
      { href: "/admin/galeri", label: "Galeri" },
    ],
  },
  {
    id: "satis",
    label: "Satış",
    items: [
      { href: "/admin/rezervasyonlar", label: "Rezervasyonlar" },
      { href: "/admin/musteriler", label: "Müşteriler" },
      { href: "/admin/odemeler", label: "Ödemeler" },
      { href: "/admin/indirim-kodlari", label: "İndirim Kodları" },
      { href: "/admin/hediye-kartlari", label: "Hediye Kartları" },
    ],
  },
  {
    id: "site",
    label: "Site",
    items: [
      { href: "/admin/site", label: "Site İçeriği" },
      { href: "/admin/blog", label: "Blog" },
      { href: "/admin/yorumlar", label: "Yorumlar" },
      { href: "/admin/site/logo", label: "Logo" },
      { href: "/admin/banner", label: "Giriş Bannerı" },
      { href: "/admin/medya", label: "Medya" },
      { href: "/admin/kullanicilar", label: "Kullanıcılar" },
      { href: "/admin/audit-log", label: "Audit Log" },
      { href: "/admin/ayarlar", label: "Ayarlar" },
    ],
  },
] as const;
