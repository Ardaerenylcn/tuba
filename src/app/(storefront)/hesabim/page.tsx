import { requireAuth } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { HesabimContent } from "./content";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hesabım | Atölye Biz" };

export default async function HesabimPage() {
  const session = await requireAuth();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      reservations: {
        orderBy: { createdAt: "desc" },
        include: {
          session: {
            include: { program: { select: { title: true, slug: true, type: true } } },
          },
        },
      },
    },
  });

  if (!user) return null;

  const upcoming = user.reservations.filter(
    (r) =>
      ["pending", "confirmed", "waitlisted"].includes(r.status) &&
      new Date(r.session.startAt) > new Date()
  );
  const past = user.reservations.filter(
    (r) =>
      !["pending", "confirmed", "waitlisted"].includes(r.status) ||
      new Date(r.session.startAt) <= new Date()
  );

  return (
    <HesabimContent
      user={{
        name: user.name,
        email: user.email,
        phone: (user as { phone?: string | null }).phone,
        createdAt: user.createdAt,
      }}
      upcoming={upcoming}
      past={past}
    />
  );
}
