import Link from "next/link";
import { db } from "@/lib/db";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard | Admin" };

const STATUS_LABELS: Record<string, string> = {
  pending: "Bekliyor", confirmed: "Onaylandı", cancelled: "İptal",
  refunded: "İade", waitlisted: "Bekleme", no_show: "Gelmedi", completed: "Tamamlandı",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700", confirmed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600", refunded: "bg-stone-100 text-stone-600",
  waitlisted: "bg-blue-50 text-blue-700", no_show: "bg-stone-100 text-stone-500",
  completed: "bg-stone-100 text-stone-600",
};

const TR_MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

async function getData() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    totalReservations, pendingReservations, totalPrograms,
    upcomingSessions, recentReservations, allReservations, programs,
  ] = await Promise.all([
    db.reservation.count(),
    db.reservation.count({ where: { status: "pending" } }),
    db.program.count({ where: { status: "published" } }),
    db.workshopSession.count({ where: { status: "published", startAt: { gte: now } } }),
    db.reservation.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { session: { include: { program: { select: { title: true } } } } },
    }),
    db.reservation.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, priceSnapshot: true, participantCount: true },
    }),
    db.program.findMany({
      where: { status: "published" },
      select: { title: true, type: true, _count: { select: { sessions: true } } },
    }),
  ]);

  // Monthly aggregation
  const monthMap: Record<string, { rezervasyon: number; gelir: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthMap[key] = { rezervasyon: 0, gelir: 0 };
  }
  for (const r of allReservations) {
    const d = new Date(r.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthMap[key]) {
      monthMap[key].rezervasyon += 1;
      monthMap[key].gelir += Number(r.priceSnapshot) * r.participantCount;
    }
  }
  const monthly = Object.entries(monthMap).map(([key, v]) => {
    const [year, month] = key.split("-").map(Number);
    return { month: `${TR_MONTHS[month]} ${year !== now.getFullYear() ? year : ""}`.trim(), ...v };
  });

  // Program distribution by reservation count
  const programDist = programs
    .map((p) => ({ name: p.title.length > 18 ? p.title.slice(0, 18) + "…" : p.title, value: p._count.sessions }))
    .filter((p) => p.value > 0)
    .slice(0, 4);

  return { totalReservations, pendingReservations, totalPrograms, upcomingSessions, recentReservations, monthly, programDist };
}

export default async function DashboardPage() {
  const { totalReservations, pendingReservations, totalPrograms, upcomingSessions, recentReservations, monthly, programDist } = await getData();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-medium text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)]">Genel bakış</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Toplam Rezervasyon", value: totalReservations },
          { label: "Bekleyen", value: pendingReservations, highlight: pendingReservations > 0 },
          { label: "Yayındaki Program", value: totalPrograms },
          { label: "Yaklaşan Oturum", value: upcomingSessions },
        ].map((stat) => (
          <div key={stat.label} className={`border p-5 ${stat.highlight ? "border-amber-200 bg-amber-50" : "border-[var(--border)] bg-[var(--surface)]"}`}>
            <p className="mb-1 text-xs text-[var(--text-muted)]">{stat.label}</p>
            <p className={`text-3xl font-light ${stat.highlight ? "text-amber-700" : "text-[var(--text-primary)]"}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts monthly={monthly} programs={programDist} />

      {/* Recent reservations */}
      <div className="border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-sm font-medium text-[var(--text-primary)]">Son Rezervasyonlar</h2>
          <Link href="/admin/rezervasyonlar" className="text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)]">Tümü</Link>
        </div>
        {recentReservations.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-[var(--text-muted)]">Henüz rezervasyon yok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {["Müşteri", "Program", "Tarih", "Kişi", "Durum"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[var(--text-muted)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {recentReservations.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--bg-subtle)]">
                    <td className="px-5 py-3">
                      <p className="font-medium text-[var(--text-primary)]">{r.customerName}</p>
                      <p className="text-xs text-[var(--text-muted)]">{r.customerEmail}</p>
                    </td>
                    <td className="px-5 py-3 text-[var(--text-secondary)]">{r.session.program.title}</td>
                    <td className="px-5 py-3 text-[var(--text-secondary)]">
                      {new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "Europe/Istanbul" }).format(new Date(r.session.startAt))}
                    </td>
                    <td className="px-5 py-3 text-[var(--text-secondary)]">{r.participantCount}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs ${STATUS_COLORS[r.status] ?? "bg-stone-100 text-stone-600"}`}>
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
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
