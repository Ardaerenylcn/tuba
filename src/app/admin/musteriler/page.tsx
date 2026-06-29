import Link from "next/link";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Müşteriler | Admin" };

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminCustomersPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const search = q?.trim() ?? "";

  const [users, guestStats] = await Promise.all([
    db.user.findMany({
      where: {
        role: { in: ["customer", "instructor"] },
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        reservations: {
          select: {
            status: true,
            priceSnapshot: true,
            participantCount: true,
            createdAt: true,
          },
        },
      },
    }),
    db.reservation.aggregate({
      where: { userId: null },
      _count: { _all: true },
    }),
  ]);

  const customers = users.map((u) => {
    const active = u.reservations.filter((r) =>
      ["pending", "confirmed", "completed"].includes(r.status)
    );
    const spend = active.reduce(
      (sum, r) => sum + Number(r.priceSnapshot) * r.participantCount,
      0
    );
    const last = u.reservations.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    return { ...u, activeCount: active.length, totalSpend: spend, lastReservation: last?.createdAt ?? null };
  });

  const totalSpendAll = customers.reduce((s, c) => s + c.totalSpend, 0);
  const withReservations = customers.filter((c) => c.activeCount > 0).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium text-[var(--text-primary)]">Müşteriler</h1>
          <p className="text-sm text-[var(--text-muted)]">{users.length} kayıtlı üye</p>
        </div>
        <a
          href="/api/v1/admin/export/customers"
          className="inline-flex h-9 items-center gap-2 border border-[var(--border)] px-4 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
        >
          CSV İndir
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Kayıtlı Üye", value: users.length },
          { label: "Rezervasyonlu", value: withReservations },
          { label: "Misafir Rezervasyon", value: guestStats._count._all },
          { label: "Toplam Harcama", value: `${totalSpendAll.toLocaleString("tr-TR")} ₺` },
        ].map((s) => (
          <div key={s.label} className="border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
            <p className="mt-1 text-xl font-light text-[var(--text-primary)]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Ad, e-posta veya telefon ara..."
          className="h-9 flex-1 border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
        />
        <button
          type="submit"
          className="h-9 bg-[var(--text-primary)] px-4 text-xs font-medium tracking-[0.08em] uppercase text-[var(--surface)] hover:bg-[var(--color-stone-700)]"
        >
          Ara
        </button>
        {search && (
          <Link
            href="/admin/musteriler"
            className="flex h-9 items-center px-3 text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)]"
          >
            Temizle
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="border border-[var(--border)] bg-[var(--surface)]">
        {customers.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-[var(--text-muted)]">
              {search ? "Arama sonucu bulunamadı." : "Henüz kayıtlı müşteri yok."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {["Müşteri", "Telefon", "Rezervasyon", "Harcama", "Son Aktivite", "Üyelik", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[var(--bg-subtle)]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--text-primary)]">{c.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{c.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                      {c.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {c.reservations.length > 0 ? (
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{c.activeCount}</p>
                          {c.reservations.length !== c.activeCount && (
                            <p className="text-xs text-[var(--text-muted)]">
                              {c.reservations.length} toplam
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--text-disabled)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {c.totalSpend > 0 ? `${c.totalSpend.toLocaleString("tr-TR")} ₺` : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                      {c.lastReservation
                        ? new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(c.lastReservation))
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                      {new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(c.createdAt))}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/musteriler/${c.id}`}
                        className="text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)]"
                      >
                        Detay
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
