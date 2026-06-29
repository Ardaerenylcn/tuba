"use client";

import Link from "next/link";

interface Session {
  id: string;
  startAt: Date;
  endAt: Date;
  capacity: number;
  availableSpots: number;
  locationName: string | null;
  priceOverride: unknown;
  instructor: { id: string; name: string } | null;
}

interface SessionListProps {
  sessions: Session[];
  programSlug: string;
  programType: "workshop" | "certificate";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).format(new Date(date));
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(new Date(date));
}

export function SessionList({ sessions, programSlug, programType }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">Şu an için açık oturum bulunmuyor.</p>
        <p className="text-xs text-[var(--text-disabled)]">Yeni tarihler yakında eklenecek.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="mb-2 text-xs font-medium tracking-[0.15em] uppercase text-[var(--text-muted)]">
        Müsait Tarihler
      </p>

      {sessions.map((session) => {
        const isFull = session.availableSpots <= 0;
        const isLow = session.availableSpots <= 2 && !isFull;

        return (
          <div
            key={session.id}
            className={`border p-4 ${isFull ? "border-[var(--border)] opacity-50" : "border-[var(--border)]"}`}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {formatDate(session.startAt)}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {formatTime(session.startAt)} – {formatTime(session.endAt)}
                </p>
              </div>
              {isLow && (
                <span className="shrink-0 text-[10px] font-medium text-[var(--accent)]">
                  Son {session.availableSpots} yer
                </span>
              )}
            </div>

            {session.locationName && (
              <p className="mb-3 text-xs text-[var(--text-muted)]">{session.locationName}</p>
            )}

            {session.instructor && (
              <p className="mb-3 text-xs text-[var(--text-muted)]">
                Eğitmen: {session.instructor.name}
              </p>
            )}

            {isFull ? (
              <span className="block text-center text-xs text-[var(--text-disabled)]">Dolu</span>
            ) : (
              <Link
                href={`/rezervasyon?session=${session.id}`}
                className="block w-full border border-[var(--text-primary)] py-2.5 text-center text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-primary)] transition-colors hover:bg-[var(--text-primary)] hover:text-[var(--surface)]"
              >
                Bu Tarihe Rezervasyon Yap
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
