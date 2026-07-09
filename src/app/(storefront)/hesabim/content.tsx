"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FadeUp } from "@/components/ui/animate";
import { ProfileForm } from "@/components/storefront/profile-form";

const ease = [0.16, 1, 0.3, 1] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: "Bekliyor",
  confirmed: "Onaylandı",
  cancelled: "İptal",
  refunded: "İade",
  waitlisted: "Bekleme",
  no_show: "Gelmedi",
  completed: "Tamamlandı",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
  completed: "bg-stone-100 text-stone-600",
  no_show: "bg-stone-100 text-stone-500",
  waitlisted: "bg-blue-50 text-blue-600",
};

interface Reservation {
  id: string;
  status: string;
  participantCount: number;
  priceSnapshot: unknown;
  createdAt: Date;
  notes?: string | null;
  session: {
    startAt: Date;
    program: { title: string; slug: string; type: string };
  };
}

interface Props {
  user: {
    name: string;
    email: string;
    phone?: string | null;
    createdAt: Date;
  };
  upcoming: Reservation[];
  past: Reservation[];
}

export function HesabimContent({ user, upcoming, past }: Props) {
  return (
    <div className="min-h-[60vh]">
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-subtle)] px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="mb-2 text-[10px] font-medium tracking-[0.35em] uppercase text-[var(--text-muted)]"
          >
            Hesabım
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.12, ease }}
            className="text-3xl font-light text-[var(--text-primary)]"
          >
            Merhaba, {user.name.split(" ")[0]}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-1 text-sm text-[var(--text-muted)]"
          >
            {user.email}
          </motion.p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-14">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_260px]">
          {/* Reservations */}
          <div className="flex flex-col gap-12">
            {/* Upcoming */}
            <FadeUp>
              <div className="flex items-baseline gap-3 mb-6">
                <h2 className="text-sm font-medium text-[var(--text-primary)]">
                  Yaklaşan Rezervasyonlar
                </h2>
                <span className="text-xs text-[var(--text-muted)]">{upcoming.length}</span>
              </div>

              {upcoming.length === 0 ? (
                <div className="flex flex-col items-center gap-4 border border-[var(--border)] py-14 text-center">
                  <p className="text-sm text-[var(--text-muted)]">Yaklaşan rezervasyonunuz yok.</p>
                  <Link
                    href="/atolyeler"
                    className="inline-flex h-9 items-center border border-[var(--border-strong)] px-5 text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-primary)] transition-colors hover:bg-[var(--text-primary)] hover:text-[var(--surface)]"
                  >
                    Atölyelere Göz At
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {upcoming.map((r, i) => (
                    <ReservationCard key={r.id} r={r} index={i} />
                  ))}
                </div>
              )}
            </FadeUp>

            {/* Past */}
            {past.length > 0 && (
              <FadeUp delay={0.1}>
                <div className="flex items-baseline gap-3 mb-6">
                  <h2 className="text-sm font-medium text-[var(--text-primary)]">
                    Geçmiş Rezervasyonlar
                  </h2>
                  <span className="text-xs text-[var(--text-muted)]">{past.length}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {past.map((r, i) => (
                    <ReservationCard key={r.id} r={r} index={i} muted />
                  ))}
                </div>
              </FadeUp>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            <FadeUp delay={0.15}>
              <div className="border border-[var(--border)] p-5">
                <p className="mb-5 text-[10px] font-medium tracking-[0.15em] uppercase text-[var(--text-muted)]">
                  Profil
                </p>
                <ProfileForm name={user.name} phone={user.phone ?? null} />
              </div>
            </FadeUp>

            <FadeUp delay={0.22}>
              <div className="border border-[var(--border)] bg-[var(--bg-subtle)] p-5">
                <p className="mb-1 text-[10px] font-medium tracking-[0.15em] uppercase text-[var(--text-muted)]">
                  Üyelik
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {new Intl.DateTimeFormat("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(user.createdAt))}
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReservationCard({
  r,
  index,
  muted = false,
}: {
  r: Reservation;
  index: number;
  muted?: boolean;
}) {
  const href = `/${r.session.program.type}/${r.session.program.slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col gap-1.5 border border-[var(--border)] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
        muted ? "opacity-70" : ""
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <Link
          href={href}
          className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
        >
          {r.session.program.title}
        </Link>
        <p className="text-xs text-[var(--text-muted)]">
          {new Intl.DateTimeFormat("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/Istanbul",
          }).format(new Date(r.session.startAt))}
          {" · "}
          {r.participantCount} kişi
        </p>
        {r.notes && (
          <p className="text-[11px] italic text-[var(--text-disabled)] max-w-xs truncate">
            {r.notes}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-light text-[var(--text-secondary)] whitespace-nowrap">
          {(Number(r.priceSnapshot) * r.participantCount).toLocaleString("tr-TR")} ₺
        </span>
        <span
          className={`inline-flex items-center px-2 py-0.5 text-[11px] ${
            STATUS_COLORS[r.status] ?? "bg-stone-100 text-stone-500"
          }`}
        >
          {STATUS_LABELS[r.status] ?? r.status}
        </span>
      </div>
    </motion.div>
  );
}
