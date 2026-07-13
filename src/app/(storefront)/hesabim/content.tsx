"use client";

import { RescheduleControl } from "@/components/storefront/reschedule-control";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { FadeUp } from "@/components/ui/animate";
import { ProfileForm } from "@/components/storefront/profile-form";

const ease = [0.16, 1, 0.3, 1] as const;
const TZ = "Europe/Istanbul";

const STATUS_LABELS: Record<string, string> = {
  pending: "Onay Bekliyor",
  confirmed: "Onaylandı",
  cancelled: "İptal Edildi",
  refunded: "İade Edildi",
  waitlisted: "Bekleme Listesi",
  no_show: "Katılım Sağlanmadı",
  completed: "Tamamlandı",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
  refunded: "bg-red-50 text-red-500",
  completed: "bg-stone-100 text-stone-600",
  no_show: "bg-stone-100 text-stone-500",
  waitlisted: "bg-blue-50 text-blue-600",
};
const PAYMENT_LABELS: Record<string, string> = {
  not_required: "Ödeme alındı",
  paid: "Ödendi",
  pending: "Ödeme Bekliyor",
  failed: "Ödeme Başarısız",
  refunded: "İade Edildi",
  partially_refunded: "Kısmi İade",
};

export interface Reservation {
  id: string;
  status: string;
  paymentStatus: string;
  participantCount: number;
  priceSnapshot: number;
  giftCardAmount: number | null;
  createdAt: string;
  notes?: string | null;
  session: {
    startAt: string;
    endAt: string;
    locationName: string | null;
    instructor: string | null;
    program: { title: string; slug: string; type: string; coverImageUrl: string | null };
  };
}

interface Props {
  user: { name: string; email: string; phone?: string | null; createdAt: string };
  upcoming: Reservation[];
  past: Reservation[];
  cancelled: Reservation[];
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: TZ }).format(new Date(iso));
}
function fmtTime(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(new Date(iso));
}
function remaining(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days} gün ${hours} saat kaldı`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours} saat ${mins} dk kaldı`;
}

export function HesabimContent({ user, upcoming, past, cancelled }: Props) {
  return (
    <div className="min-h-[60vh]">
      <div className="border-b border-[var(--border)] bg-[var(--bg-subtle)] px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05, ease }}
            className="mb-2 text-[10px] font-medium tracking-[0.35em] uppercase text-[var(--text-muted)]">Hesabım</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.12, ease }}
            className="text-3xl font-light text-[var(--text-primary)]">Merhaba, {user.name.split(" ")[0]}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-1 text-sm text-[var(--text-muted)]">{user.email}</motion.p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-14">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_260px]">
          <div className="flex flex-col gap-12">
            {/* Yaklaşan */}
            <FadeUp>
              <SectionHeader title="Yaklaşan Rezervasyonlar" count={upcoming.length} />
              {upcoming.length === 0 ? (
                <div className="flex flex-col items-center gap-4 border border-dashed border-[var(--border)] py-14 text-center">
                  <p className="text-sm text-[var(--text-muted)]">Yaklaşan rezervasyonunuz yok.</p>
                  <Link href="/takvim" className="inline-flex h-9 items-center border border-[var(--border-strong)] px-5 text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-primary)] transition-colors hover:bg-[var(--text-primary)] hover:text-[var(--surface)]">
                    Takvime Göz At
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {upcoming.map((r, i) => <ReservationCard key={r.id} r={r} index={i} cancelable />)}
                </div>
              )}
            </FadeUp>

            {/* Geçmiş */}
            {past.length > 0 && (
              <FadeUp delay={0.1}>
                <SectionHeader title="Geçmiş Rezervasyonlar" count={past.length} />
                <div className="flex flex-col gap-3">
                  {past.map((r, i) => <ReservationCard key={r.id} r={r} index={i} muted />)}
                </div>
              </FadeUp>
            )}

            {/* İptal edilen */}
            {cancelled.length > 0 && (
              <FadeUp delay={0.15}>
                <SectionHeader title="İptal Edilen Rezervasyonlar" count={cancelled.length} />
                <div className="flex flex-col gap-3">
                  {cancelled.map((r, i) => <ReservationCard key={r.id} r={r} index={i} muted />)}
                </div>
              </FadeUp>
            )}
          </div>

          {/* Yan panel */}
          <div className="flex flex-col gap-5">
            <FadeUp delay={0.15}>
              <div className="border border-[var(--border)] p-5">
                <p className="mb-5 text-[10px] font-medium tracking-[0.15em] uppercase text-[var(--text-muted)]">Profil</p>
                <ProfileForm name={user.name} phone={user.phone ?? null} />
              </div>
            </FadeUp>
            <FadeUp delay={0.22}>
              <div className="border border-[var(--border)] bg-[var(--bg-subtle)] p-5">
                <p className="mb-1 text-[10px] font-medium tracking-[0.15em] uppercase text-[var(--text-muted)]">Üyelik</p>
                <p className="text-sm text-[var(--text-secondary)]">{fmtDate(user.createdAt)}</p>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="mb-6 flex items-baseline gap-3">
      <h2 className="text-sm font-medium text-[var(--text-primary)]">{title}</h2>
      <span className="text-xs text-[var(--text-muted)]">{count}</span>
    </div>
  );
}

function buildIcsHref(r: Reservation): string {
  const toICS = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tuba Atman Jewelry//Atolye Biz//TR",
    "BEGIN:VEVENT",
    `UID:${r.id}@tubaatman.com`,
    `DTSTAMP:${toICS(new Date().toISOString())}`,
    `DTSTART:${toICS(r.session.startAt)}`,
    `DTEND:${toICS(r.session.endAt)}`,
    `SUMMARY:${r.session.program.title}`,
    r.session.locationName ? `LOCATION:${r.session.locationName}` : "",
    "DESCRIPTION:Atölye Biz rezervasyonu",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

function ReservationCard({ r, index, muted = false, cancelable = false }: { r: Reservation; index: number; muted?: boolean; cancelable?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const href = `/${r.session.program.type}/${r.session.program.slug}`;
  const total = r.priceSnapshot * r.participantCount;
  const net = Math.max(0, total - (r.giftCardAmount ?? 0));
  const resNo = r.id.slice(-8).toUpperCase();

  async function cancel() {
    if (!confirm("Bu rezervasyonu iptal etmek istediğinize emin misiniz?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/reservations/${r.id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!data.success) { setError(data.message ?? "İptal edilemedi."); return; }
      router.refresh();
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.07, ease }}
      className={`overflow-hidden border border-[var(--border)] ${muted ? "opacity-80" : ""}`}
    >
      <div className="flex gap-4 p-4">
        {/* Kapak */}
        <Link href={href} className="relative hidden h-20 w-16 shrink-0 overflow-hidden bg-[var(--bg-subtle)] sm:block">
          {r.session.program.coverImageUrl ? (
            <Image src={r.session.program.coverImageUrl} alt={r.session.program.title} fill sizes="64px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[var(--text-disabled)]">◆</span>
          )}
        </Link>

        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <Link href={href} className="text-sm font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--accent)]">
              {r.session.program.title}
            </Link>
            <span className={`shrink-0 px-2 py-0.5 text-[11px] ${STATUS_COLORS[r.status] ?? "bg-stone-100 text-stone-500"}`}>
              {STATUS_LABELS[r.status] ?? r.status}
            </span>
          </div>

          <p className="text-xs text-[var(--text-secondary)]">
            {fmtDate(r.session.startAt)} · {fmtTime(r.session.startAt)}–{fmtTime(r.session.endAt)}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[var(--text-muted)]">
            {r.session.locationName && <span>📍 {r.session.locationName}</span>}
            {r.session.instructor && <span>👤 {r.session.instructor}</span>}
            <span>{r.participantCount} kişi</span>
            <span>#{resNo}</span>
          </div>

          {cancelable && (
            <p className="text-[11px] font-medium text-[var(--accent)]">{remaining(r.session.startAt)}</p>
          )}

          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-primary)]">{net.toLocaleString("tr-TR")} ₺</span>
              {r.giftCardAmount ? <span className="text-[11px] text-green-700">(hediye: −{r.giftCardAmount.toLocaleString("tr-TR")} ₺)</span> : null}
            </div>
            <button onClick={() => setOpen((o) => !o)} className="text-[11px] text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text-primary)]">
              {open ? "Gizle" : "Detaylar"}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-2 border-t border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3 text-xs text-[var(--text-secondary)]">
          <Row label="Rezervasyon No" value={`#${resNo}`} />
          <Row label="Rezervasyon Tarihi" value={fmtDate(r.createdAt)} />
          <Row label="Ödeme Durumu" value={PAYMENT_LABELS[r.paymentStatus] ?? r.paymentStatus} />
          <Row label="Toplam" value={`${total.toLocaleString("tr-TR")} ₺`} />
          {r.notes && <Row label="Not" value={r.notes} />}
          {error && <p className="text-red-600">{error}</p>}
          {cancelable && (
            <div className="mt-1 flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <a href={buildIcsHref(r)} download="atolye-rezervasyon.ics"
                  className="inline-flex items-center gap-1.5 border border-[var(--border)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]">
                  📅 Takvime ekle
                </a>
                <button onClick={cancel} disabled={loading}
                  className="border border-red-200 px-3 py-1.5 text-[11px] font-medium text-red-600 transition-colors hover:border-red-400 disabled:opacity-50">
                  {loading ? "İptal ediliyor..." : "Rezervasyonu İptal Et"}
                </button>
              </div>
              <RescheduleControl reservationId={r.id} />
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="text-right text-[var(--text-primary)]">{value}</span>
    </div>
  );
}
