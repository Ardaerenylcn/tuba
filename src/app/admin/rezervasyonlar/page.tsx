import Link from "next/link";
import { db } from "@/lib/db";
import { ReservationsTable, type ReservationRow } from "@/components/admin/reservations-table";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Rezervasyonlar | Admin" };

const FILTER_TABS = [
  { key: "all", label: "Tümü" },
  { key: "pending", label: "Bekliyor" },
  { key: "confirmed", label: "Onaylandı" },
  { key: "waitlisted", label: "Bekleme Listesi" },
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

  const rows: ReservationRow[] = reservations.map((r) => ({
    id: r.id,
    customerName: r.customerName,
    customerEmail: r.customerEmail,
    customerPhone: r.customerPhone,
    notes: r.notes,
    programTitle: r.session.program.title,
    startAt: r.session.startAt.toISOString(),
    participantCount: r.participantCount,
    total: Number(r.priceSnapshot) * r.participantCount,
    status: r.status,
    paymentStatus: r.paymentStatus,
    createdAt: r.createdAt.toISOString(),
  }));

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
      <ReservationsTable rows={rows} />

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
