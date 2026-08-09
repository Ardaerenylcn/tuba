import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession as getAuthSession } from "@/lib/auth-server";
import { ReservationForm } from "@/components/storefront/reservation-form";
import { WaitlistForm } from "@/components/storefront/waitlist-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Rezervasyon" };

interface Props {
  searchParams: Promise<{ session?: string }>;
}

async function getSession(id: string) {
  return db.workshopSession.findUnique({
    where: { id, status: "published" },
    include: {
      program: { select: { title: true, slug: true, type: true, basePrice: true, currency: true } },
      instructor: { select: { name: true } },
      _count: {
        select: {
          reservations: { where: { status: { in: ["pending", "confirmed"] } } },
        },
      },
    },
  });
}

async function ReservationPageContent({ sessionId }: { sessionId: string }) {
  const session = await getSession(sessionId);

  if (!session) notFound();

  const availableSpots = session.capacity - session._count.reservations;
  if (availableSpots <= 0) {
    const whenStr = new Intl.DateTimeFormat("tr-TR", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul",
    }).format(new Date(session.startAt));
    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[var(--text-muted)]">Bekleme Listesi</p>
        <h1 className="mb-2 text-3xl font-light tracking-tight text-[var(--text-primary)]">{session.program.title}</h1>
        <p className="mb-8 text-sm text-[var(--text-secondary)]">{whenStr}</p>
        <WaitlistForm sessionId={session.id} maxParticipants={session.capacity} />
        <div className="mt-6 text-center">
          <Link href={`/${session.program.type}/${session.program.slug}`} className="text-xs text-[var(--text-secondary)] underline underline-offset-4 hover:text-[var(--text-primary)]">
            Diğer tarihleri gör
          </Link>
        </div>
      </div>
    );
  }

  // Ders satın almak (rezervasyon) için üyelik zorunlu — giriş yoksa girişe yönlendir.
  const authSession = await getAuthSession();
  if (!authSession) {
    redirect(`/giris?redirect=${encodeURIComponent(`/rezervasyon?session=${sessionId}`)}`);
  }

  const price = session.priceOverride ?? session.program.basePrice;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-12">
        <p className="mb-3 text-xs font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">
          Rezervasyon
        </p>
        <h1 className="text-3xl font-light tracking-tight text-[var(--text-primary)]">
          {session.program.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
        {/* Form */}
        <ReservationForm
          sessionId={session.id}
          maxParticipants={availableSpots}
          pricePerPerson={Number(price)}
          currency={session.program.currency}
        />

        {/* Summary */}
        <aside>
          <div className="border border-[var(--border)] p-6">
            <p className="mb-4 text-xs font-medium tracking-[0.15em] uppercase text-[var(--text-muted)]">
              Oturum Özeti
            </p>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Tarih</span>
                <span className="text-[var(--text-primary)]">
                  {new Intl.DateTimeFormat("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "Europe/Istanbul",
                  }).format(new Date(session.startAt))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Saat</span>
                <span className="text-[var(--text-primary)]">
                  {new Intl.DateTimeFormat("tr-TR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Europe/Istanbul",
                  }).format(new Date(session.startAt))}
                  {" – "}
                  {new Intl.DateTimeFormat("tr-TR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Europe/Istanbul",
                  }).format(new Date(session.endAt))}
                </span>
              </div>
              {session.instructor && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Eğitmen</span>
                  <span className="text-[var(--text-primary)]">{session.instructor.name}</span>
                </div>
              )}
              {session.locationName && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Konum</span>
                  <span className="text-[var(--text-primary)]">{session.locationName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Kalan Yer</span>
                <span className="text-[var(--text-primary)]">{availableSpots} kişi</span>
              </div>

              <hr className="border-[var(--border)]" />

              <div className="flex justify-between text-base">
                <span className="text-[var(--text-muted)]">Kişi Başı</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {Number(price).toLocaleString("tr-TR")} ₺
                </span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-[var(--text-muted)]">
            Rezervasyonunuz oluşturulduktan sonra e-posta ile onay alacaksınız.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default async function ReservationPage({ searchParams }: Props) {
  const { session: sessionId } = await searchParams;

  if (!sessionId) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-6">
        <p className="text-sm text-[var(--text-muted)]">Geçerli bir oturum seçilmedi.</p>
        <Link href="/atolyeler" className="text-xs underline underline-offset-4 text-[var(--text-secondary)]">
          Atölyelere dön
        </Link>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-[var(--text-muted)]">Yükleniyor...</p>
      </div>
    }>
      <ReservationPageContent sessionId={sessionId} />
    </Suspense>
  );
}
