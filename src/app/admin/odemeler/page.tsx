import { db } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Ödemeler | Admin" };

const STATUS_LABELS: Record<string, string> = {
  not_required: "Gerekmiyor",
  pending: "Bekliyor",
  paid: "Ödendi",
  failed: "Başarısız",
  refunded: "İade",
  partially_refunded: "Kısmi İade",
};

const STATUS_COLORS: Record<string, string> = {
  not_required: "bg-stone-100 text-stone-500",
  pending: "bg-amber-50 text-amber-700",
  paid: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-600",
  refunded: "bg-stone-100 text-stone-600",
  partially_refunded: "bg-blue-50 text-blue-700",
};

const FILTER_TABS = [
  { key: "all", label: "Tümü" },
  { key: "paid", label: "Ödendi" },
  { key: "pending", label: "Bekliyor" },
  { key: "failed", label: "Başarısız" },
  { key: "refunded", label: "İade" },
];

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminPaymentsPage({ searchParams }: Props) {
  const { status: statusFilter } = await searchParams;
  const activeFilter = FILTER_TABS.find((t) => t.key === statusFilter)?.key ?? "all";

  const payments = await db.payment.findMany({
    where: activeFilter !== "all" ? { status: activeFilter as "paid" | "pending" | "failed" | "refunded" | "partially_refunded" | "not_required" } : {},
    orderBy: { createdAt: "desc" },
    include: {
      reservation: {
        select: {
          customerName: true,
          customerEmail: true,
          participantCount: true,
          session: { select: { program: { select: { title: true } } } },
        },
      },
    },
  });

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium text-[var(--text-primary)]">Ödemeler</h1>
          <p className="text-sm text-[var(--text-muted)]">{payments.length} kayıt</p>
        </div>
        <div className="border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-right">
          <p className="text-xs text-[var(--text-muted)]">Toplam Tahsilat</p>
          <p className="text-lg font-medium text-[var(--text-primary)]">
            {totalPaid.toLocaleString("tr-TR")} ₺
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-[var(--border)]">
        {FILTER_TABS.map((tab) => {
          const active = tab.key === activeFilter;
          const count = tab.key === "all" ? payments.length : payments.filter((p) => p.status === tab.key).length;
          return (
            <Link
              key={tab.key}
              href={tab.key === "all" ? "/admin/odemeler" : `/admin/odemeler?status=${tab.key}`}
              className={`flex items-center gap-1.5 border-b-2 px-3 pb-3 pt-1 text-xs font-medium transition-colors ${
                active
                  ? "border-[var(--text-primary)] text-[var(--text-primary)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-[var(--text-primary)] text-[var(--surface)]" : "bg-[var(--bg-subtle)] text-[var(--text-muted)]"}`}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="border border-[var(--border)] bg-[var(--surface)]">
        {payments.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-[var(--text-muted)]">Bu filtrede ödeme yok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {["Müşteri", "Program", "Sağlayıcı", "Tutar", "Durum", "Tarih"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--bg-subtle)]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--text-primary)]">{p.reservation.customerName}</p>
                      <p className="text-xs text-[var(--text-muted)]">{p.reservation.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {p.reservation.session.program.title}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)] capitalize">
                      {p.provider}
                      {p.providerPaymentId && (
                        <p className="font-mono text-[10px] text-[var(--text-disabled)]">
                          {p.providerPaymentId.slice(0, 12)}…
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                      {Number(p.amount).toLocaleString("tr-TR")} ₺
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs ${STATUS_COLORS[p.status] ?? ""}`}>
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                      {new Intl.DateTimeFormat("tr-TR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Europe/Istanbul",
                      }).format(new Date(p.createdAt))}
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
