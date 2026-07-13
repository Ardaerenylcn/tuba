import Link from "next/link";
import { db } from "@/lib/db";
import { ReservationActions } from "@/components/admin/reservation-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Rezervasyonlar | Admin" };

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
  refunded: "bg-stone-100 text-stone-600",
  waitlisted: "bg-blue-50 text-blue-700",
  no_show: "bg-stone-100 text-stone-500",
  completed: "bg-stone-100 text-stone-600",
};

const PAYMENT_LABELS: Record<string, string> = {
  not_required: "—",
  pending: "Bekliyor",
  paid: "Ödendi",
  failed: "Başarısız",
  refunded: "İade",
  partially_refunded: "Kısmi İade",
};

const FILTER_TABS = [
  { key: "all", label: "Tümü" },
  { key: "pending", label: "Bekliyor" },
  { key: "confirmed", label: "Onaylandı" },
  { key: "cancelled", label: "İptal" },
  { key: "completed", label: "Tamamlandı" },
];

interface Props {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}

const PAGE_SIZE = 25;

export default async function AdminReservationsPage({ searchParams }: Props) {
  const { status: statusFilter, q: rawQ, page: rawPage } = await searchParams;
  const activeFilter = FILTER_TABS.find((t) => t.key === statusFilter)?.key ?? "all";
  const q = (rawQ ?? "").trim();
  const page = Math.max(1, Number.parseInt(rawPage ?? "1") || 1);

  const where = {
    ...(activeFilter !== "all"
      ? { status: activeFilter as "pending" | "confirmed" | "cancelled" | "completed" | "refunded" | "waitlisted" | "no_show" }
      : {}),
    ...(q
      ? {
          OR: [
            { customerName: { contains: q, mode: "insensitive" as const } },
            { customerEmail: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [reservations, filteredCount, counts] = await Promise.all([
    db.reservation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: {
        session: {
          include: { program: { select: { title: true, type: true } } },
        },
      },
    }),
    db.reservation.count({ where }),
    db.reservation.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const countMap: Record<string, number> = {};
  for (const c of counts) countMap[c.status] = c._count._all;
  const total = Object.values(countMap).reduce((a, b) => a + b, 0);
  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const qs = (extra: Record<string, string | number>) => {
    const p = new URLSearchParams();
    if (activeFilter !== "all") p.set("status", activeFilter);
    if (q) p.set("q", q);
    for (const [k, v] of Object.entries(extra)) p.set(k, String(v));
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium text-[var(--text-primary)]">Rezervasyonlar</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {q || activeFilter !== "all" ? `${filteredCount} sonuç · ${total} toplam` : `${total} toplam`}
          </p>
        </div>
        {/* CSV indirme — sayfa değil, dosya indiren API ucu; <a> doğru kullanımdır */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/v1/admin/export/reservations"
          download
          className="inline-flex h-9 items-center gap-2 border border-[var(--border)] px-4 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
        >
          CSV İndir
        </a>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--border)]">
        {FILTER_TABS.map((tab) => {
          const count = tab.key === "all" ? total : (countMap[tab.key] ?? 0);
          const active = tab.key === activeFilter;
          return (
            <Link
              key={tab.key}
              href={tab.key === "all" ? "/admin/rezervasyonlar" : `/admin/rezervasyonlar?status=${tab.key}`}
              className={`flex items-center gap-1.5 border-b-2 px-3 pb-3 pt-1 text-xs font-medium transition-colors ${
                active
                  ? "border-[var(--text-primary)] text-[var(--text-primary)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  active ? "bg-[var(--text-primary)] text-[var(--surface)]" : "bg-[var(--bg-subtle)] text-[var(--text-muted)]"
                }`}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Arama */}
      <form action="/admin/rezervasyonlar" method="get" className="flex gap-2">
        {activeFilter !== "all" && <input type="hidden" name="status" value={activeFilter} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Müşteri adı veya e-posta ara…"
          className="h-9 w-full max-w-sm border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
          aria-label="Rezervasyon ara"
        />
        <button type="submit" className="h-9 shrink-0 border border-[var(--border)] px-4 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]">
          Ara
        </button>
        {q && (
          <Link href={activeFilter !== "all" ? `/admin/rezervasyonlar?status=${activeFilter}` : "/admin/rezervasyonlar"} className="inline-flex h-9 items-center px-3 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            Temizle
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="border border-[var(--border)] bg-[var(--surface)]">
        {reservations.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-[var(--text-muted)]">Bu filtrede rezervasyon yok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {["Müşteri", "Program / Oturum", "Kişi", "Toplam", "Durum", "Ödeme", "Tarih", "İşlem"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--bg-subtle)]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--text-primary)]">{r.customerName}</p>
                      <p className="text-xs text-[var(--text-muted)]">{r.customerEmail}</p>
                      <p className="text-xs text-[var(--text-muted)]">{r.customerPhone}</p>
                      {r.notes && (
                        <p className="mt-1 max-w-[200px] truncate text-[10px] italic text-[var(--text-disabled)]" title={r.notes}>
                          {r.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[var(--text-primary)]">{r.session.program.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {new Intl.DateTimeFormat("tr-TR", {
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Europe/Istanbul",
                        }).format(new Date(r.session.startAt))}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{r.participantCount}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {(Number(r.priceSnapshot) * r.participantCount).toLocaleString("tr-TR")} ₺
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs ${STATUS_COLORS[r.status] ?? ""}`}>
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[var(--text-muted)]">
                        {PAYMENT_LABELS[r.paymentStatus] ?? r.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                      {new Intl.DateTimeFormat("tr-TR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">Sayfa {page} / {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={qs({ page: page - 1 })} className="inline-flex h-9 items-center border border-[var(--border)] px-4 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]">
                ← Önceki
              </Link>
            )}
            {page < totalPages && (
              <Link href={qs({ page: page + 1 })} className="inline-flex h-9 items-center border border-[var(--border)] px-4 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]">
                Sonraki →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
