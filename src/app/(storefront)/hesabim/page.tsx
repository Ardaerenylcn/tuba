import { requireAuth } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { HesabimContent, type Reservation } from "./content";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hesabım | Atölye Biz" };

const ACTIVE = ["pending", "confirmed", "waitlisted"];
const CANCELLED = ["cancelled", "refunded"];

export default async function HesabimPage() {
  const session = await requireAuth();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, createdAt: true },
  });
  if (!user) return null;

  // Rezervasyonları hem kullanıcı kimliği hem e-posta ile eşle
  // (giriş öncesi / misafir olarak yapılmış olabilir)
  const reservationsRaw = await db.reservation.findMany({
    where: {
      OR: [{ userId: session.user.id }, { customerEmail: user.email }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      session: {
        select: {
          startAt: true,
          endAt: true,
          locationName: true,
          instructor: { select: { name: true } },
          program: {
            select: { title: true, slug: true, type: true, coverImage: { select: { url: true } } },
          },
        },
      },
    },
  });

  const now = new Date();
  const reservations: Reservation[] = reservationsRaw.map((r) => ({
    id: r.id,
    status: r.status,
    paymentStatus: r.paymentStatus,
    participantCount: r.participantCount,
    priceSnapshot: Number(r.priceSnapshot),
    giftCardAmount: r.giftCardAmount ? Number(r.giftCardAmount) : null,
    createdAt: r.createdAt.toISOString(),
    notes: r.notes,
    session: {
      startAt: r.session.startAt.toISOString(),
      endAt: r.session.endAt.toISOString(),
      locationName: r.session.locationName,
      instructor: r.session.instructor?.name ?? null,
      program: {
        title: r.session.program.title,
        slug: r.session.program.slug,
        type: r.session.program.type,
        coverImageUrl: r.session.program.coverImage?.url ?? null,
      },
    },
  }));

  const upcoming = reservations
    .filter((r) => ACTIVE.includes(r.status) && new Date(r.session.startAt) > now)
    .sort((a, b) => new Date(a.session.startAt).getTime() - new Date(b.session.startAt).getTime());

  const cancelled = reservations.filter((r) => CANCELLED.includes(r.status));

  const past = reservations.filter(
    (r) => !CANCELLED.includes(r.status) && !(ACTIVE.includes(r.status) && new Date(r.session.startAt) > now),
  );

  return (
    <HesabimContent
      user={{ name: user.name, email: user.email, phone: user.phone, createdAt: user.createdAt.toISOString() }}
      upcoming={upcoming}
      past={past}
      cancelled={cancelled}
    />
  );
}
