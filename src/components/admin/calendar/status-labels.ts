/** Takvimde kullanılan durum etiketleri ve renkleri — tek kaynak. */

export const SESSION_STATUS_LABELS: Record<string, string> = {
  draft: "Taslak",
  published: "Yayında",
  full: "Dolu",
  cancelled: "İptal edildi",
  completed: "Tamamlandı",
};

/** Takvim bloğunun sol kenar rengi — durum ayrımı için. */
export const SESSION_STATUS_ACCENT: Record<string, string> = {
  draft: "border-l-stone-400 bg-stone-50 text-stone-700",
  published: "border-l-emerald-500 bg-emerald-50 text-emerald-800",
  full: "border-l-amber-500 bg-amber-50 text-amber-800",
  cancelled: "border-l-red-400 bg-red-50 text-red-700 line-through",
  completed: "border-l-stone-300 bg-stone-50 text-stone-500",
};

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  pending: "Bekliyor",
  confirmed: "Onaylandı",
  cancelled: "İptal edildi",
  refunded: "İade edildi",
  waitlisted: "Bekleme listesi",
  no_show: "Katılmadı",
  completed: "Tamamlandı",
};

export const RESERVATION_STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-600",
  refunded: "bg-stone-100 text-stone-600",
  waitlisted: "bg-sky-50 text-sky-700",
  no_show: "bg-stone-100 text-stone-500",
  completed: "bg-stone-100 text-stone-600",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  not_required: "Gerekmiyor",
  pending: "Bekliyor",
  paid: "Ödendi",
  failed: "Başarısız",
  refunded: "İade",
  partially_refunded: "Kısmi iade",
};

/** Doluluğa göre renk — %100 kırmızı değil amber, çünkü dolu olmak kötü değil. */
export function occupancyTone(booked: number, capacity: number): string {
  if (capacity === 0) return "text-[var(--text-muted)]";
  const ratio = booked / capacity;
  if (ratio >= 1) return "text-amber-700";
  if (ratio >= 0.7) return "text-emerald-700";
  if (ratio > 0) return "text-[var(--text-secondary)]";
  return "text-[var(--text-muted)]";
}
