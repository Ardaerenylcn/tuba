import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ReservationActions } from "@/components/admin/reservation-actions";
import { MemberActions } from "@/components/admin/member-actions";
import { membershipStatus } from "@/lib/membership";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id }, select: { name: true } });
  return { title: user ? `${user.name} | Müşteriler | Admin` : "Müşteri | Admin" };
}

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
  no_show: "bg-stone-100 text-stone-500",
  completed: "bg-stone-100 text-stone-600",
};

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    include: {
      reservations: {
        orderBy: { createdAt: "desc" },
        include: {
          session: {
            include: { program: { select: { title: true, type: true } } },
          },
        },
      },
    },
  });

  if (!user) notFound();

  const activeReservations = user.reservations.filter((r) =>
    ["pending", "confirmed", "completed"].includes(r.status)
  );
  const totalSpend = activeReservations.reduce(
    (sum, r) => sum + Number(r.priceSnapshot) * r.participantCount,
    0
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Back + header */}
      <div>
        <Link
          href="/admin/musteriler"
          className="mb-3 inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          ← Müşteriler
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-medium text-[var(--text-primary)]">{user.name}</h1>
          {(() => { const s = membershipStatus(user.isActive, user.emailVerified); return (
            <span className={`inline-flex items-center px-2 py-0.5 text-xs ${s.tone}`}>{s.label}</span>
          ); })()}
        </div>
        <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
      </div>

      {/* Üyelik yönetimi */}
      <MemberActions
        userId={user.id}
        initialActive={user.isActive}
        initialNotes={user.adminNotes}
        emailVerified={user.emailVerified}
      />

      {/* Profile + stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--text-muted)]">Telefon</p>
          <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{user.phone ?? "—"}</p>
        </div>
        <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--text-muted)]">Toplam Rezervasyon</p>
          <p className="mt-1 text-xl font-light text-[var(--text-primary)]">{user.reservations.length}</p>
        </div>
        <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--text-muted)]">Toplam Harcama</p>
          <p className="mt-1 text-xl font-light text-[var(--text-primary)]">
            {totalSpend > 0 ? `${totalSpend.toLocaleString("tr-TR")} ₺` : "—"}
          </p>
        </div>
        <div className="border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--text-muted)]">Üye Olma Tarihi</p>
          <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
            {new Intl.DateTimeFormat("tr-TR", {
              day: "numeric", month: "long", year: "numeric",
            }).format(new Date(user.createdAt))}
          </p>
        </div>
      </div>

      {/* Reservations */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-[var(--text-primary)]">
          Rezervasyonlar
          <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">
            {user.reservations.length} toplam
          </span>
        </h2>

        <div className="border border-[var(--border)] bg-[var(--surface)]">
          {user.reservations.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-[var(--text-muted)]">Henüz rezervasyon yok.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {["Program / Oturum", "Kişi", "Toplam", "Durum", "Tarih", "İşlem"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {user.reservations.map((r) => (
                    <tr key={r.id} className="hover:bg-[var(--bg-subtle)]">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--text-primary)]">
                          {r.session.program.title}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {new Intl.DateTimeFormat("tr-TR", {
                            day: "numeric",
                            month: "long",
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "Europe/Istanbul",
                          }).format(new Date(r.session.startAt))}
                        </p>
                        {r.notes && (
                          <p className="mt-0.5 max-w-xs truncate text-[10px] italic text-[var(--text-disabled)]" title={r.notes}>
                            {r.notes}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{r.participantCount}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">
                        {(Number(r.priceSnapshot) * r.participantCount).toLocaleString("tr-TR")} ₺
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs ${STATUS_COLORS[r.status] ?? "bg-stone-100 text-stone-500"}`}>
                          {STATUS_LABELS[r.status] ?? r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                        {new Intl.DateTimeFormat("tr-TR", {
                          day: "numeric", month: "short", year: "numeric",
                        }).format(new Date(r.createdAt))}
                      </td>
                      <td className="px-4 py-3">
                        <ReservationActions id={r.id} status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
