import Link from "next/link";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Rezervasyon Alındı" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ id?: string }>;
}

const TZ = "Europe/Istanbul";

function toICSDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function buildICS(opts: { uid: string; title: string; start: Date; end: Date; location: string | null; desc: string }) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tuba Atman Jewelry//Atolye Biz//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${opts.uid}@tubaatman.com`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(opts.start)}`,
    `DTEND:${toICSDate(opts.end)}`,
    `SUMMARY:${opts.title}`,
    opts.location ? `LOCATION:${opts.location}` : "",
    `DESCRIPTION:${opts.desc}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: TZ }).format(d);
}
function fmtTime(d: Date) {
  return new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(d);
}

export default async function ReservationSuccessPage({ searchParams }: Props) {
  const { id } = await searchParams;

  const reservation = id
    ? await db.reservation.findUnique({
        where: { id },
        select: {
          id: true,
          participantCount: true,
          session: {
            select: {
              startAt: true,
              endAt: true,
              locationName: true,
              instructor: { select: { name: true } },
              program: { select: { title: true } },
            },
          },
        },
      })
    : null;

  let icsHref: string | null = null;
  if (reservation) {
    const s = reservation.session;
    const ics = buildICS({
      uid: reservation.id,
      title: s.program.title,
      start: new Date(s.startAt),
      end: new Date(s.endAt),
      location: s.locationName,
      desc: `${s.program.title} — Atölye Biz rezervasyonu`,
    });
    icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
      <div className="mb-8 flex h-16 w-16 items-center justify-center border border-[var(--border)]">
        <svg className="h-6 w-6 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[var(--text-muted)]">Tamamlandı</p>
      <h1 className="mb-4 text-3xl font-light tracking-tight text-[var(--text-primary)]">Rezervasyonunuz alındı.</h1>
      <p className="mb-8 text-base leading-relaxed text-[var(--text-secondary)]">
        Onay bilgileri e-posta adresinize gönderildi. Görüşmek üzere!
      </p>

      {reservation && (
        <div className="mb-8 w-full border border-[var(--border)] bg-[var(--surface)] p-6 text-left">
          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">Rezervasyon Özeti</p>
          <div className="flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-muted)]">Program</span>
              <span className="text-right font-medium text-[var(--text-primary)]">{reservation.session.program.title}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-muted)]">Tarih</span>
              <span className="text-[var(--text-primary)]">{fmtDate(new Date(reservation.session.startAt))}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-muted)]">Saat</span>
              <span className="text-[var(--text-primary)]">
                {fmtTime(new Date(reservation.session.startAt))} – {fmtTime(new Date(reservation.session.endAt))}
              </span>
            </div>
            {reservation.session.instructor && (
              <div className="flex justify-between gap-4">
                <span className="text-[var(--text-muted)]">Eğitmen</span>
                <span className="text-[var(--text-primary)]">{reservation.session.instructor.name}</span>
              </div>
            )}
            {reservation.session.locationName && (
              <div className="flex justify-between gap-4">
                <span className="text-[var(--text-muted)]">Konum</span>
                <span className="text-right text-[var(--text-primary)]">{reservation.session.locationName}</span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-muted)]">Katılımcı</span>
              <span className="text-[var(--text-primary)]">{reservation.participantCount} kişi</span>
            </div>
          </div>

          {icsHref && (
            <a
              href={icsHref}
              download="atolye-rezervasyon.ics"
              className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 bg-[var(--text-primary)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--surface)] transition-colors hover:bg-[var(--accent-hover)]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              Takvime Ekle (.ics)
            </a>
          )}
        </div>
      )}

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link href="/hesabim" className="inline-flex h-11 items-center justify-center border border-[var(--border-strong)] px-6 text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-primary)] transition-colors hover:border-[var(--text-primary)]">
          Rezervasyonlarım
        </Link>
        <Link href="/" className="text-sm text-[var(--text-secondary)] underline underline-offset-4 transition-colors hover:text-[var(--text-primary)]">
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
