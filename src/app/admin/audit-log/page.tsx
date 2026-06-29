import { db } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Audit Log | Admin" };

const PAGE_SIZE = 50;

interface Props {
  searchParams: Promise<{ page?: string; entity?: string }>;
}

export default async function AuditLogPage({ searchParams }: Props) {
  const { page: pageParam, entity: entityFilter } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = entityFilter ? { entityType: entityFilter } : {};

  const [logs, total, entityTypes] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: { actor: { select: { name: true, email: true } } },
    }),
    db.auditLog.count({ where }),
    db.auditLog.findMany({
      distinct: ["entityType"],
      select: { entityType: true },
      orderBy: { entityType: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-medium text-[var(--text-primary)]">Audit Log</h1>
        <p className="text-sm text-[var(--text-muted)]">{total} kayıt</p>
      </div>

      {/* Entity filter */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/audit-log"
          className={`px-3 py-1.5 text-xs ${!entityFilter ? "bg-[var(--text-primary)] text-[var(--surface)]" : "border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"}`}
        >
          Tümü
        </Link>
        {entityTypes.map((e) => (
          <Link
            key={e.entityType}
            href={`/admin/audit-log?entity=${e.entityType}`}
            className={`px-3 py-1.5 text-xs ${entityFilter === e.entityType ? "bg-[var(--text-primary)] text-[var(--surface)]" : "border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"}`}
          >
            {e.entityType}
          </Link>
        ))}
      </div>

      <div className="border border-[var(--border)] bg-[var(--surface)]">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-[var(--text-muted)]">Log bulunamadı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {["Kullanıcı", "İşlem", "Nesne", "Tarih"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--bg-subtle)]">
                    <td className="px-4 py-3">
                      {log.actor ? (
                        <>
                          <p className="font-medium text-[var(--text-primary)]">{log.actor.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{log.actor.email}</p>
                        </>
                      ) : (
                        <span className="text-xs text-[var(--text-disabled)]">Sistem</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[var(--text-secondary)]">{log.action}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[var(--text-secondary)]">{log.entityType}</span>
                      {log.entityId && (
                        <p className="font-mono text-[10px] text-[var(--text-disabled)]">
                          {log.entityId.slice(0, 12)}…
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                      {new Intl.DateTimeFormat("tr-TR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Europe/Istanbul",
                      }).format(new Date(log.createdAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>
            {skip + 1}–{Math.min(skip + PAGE_SIZE, total)} / {total}
          </span>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={`/admin/audit-log?${entityFilter ? `entity=${entityFilter}&` : ""}page=${page - 1}`}
                className="border border-[var(--border)] px-3 py-1.5 hover:bg-[var(--bg-subtle)]"
              >
                ← Önceki
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/audit-log?${entityFilter ? `entity=${entityFilter}&` : ""}page=${page + 1}`}
                className="border border-[var(--border)] px-3 py-1.5 hover:bg-[var(--bg-subtle)]"
              >
                Sonraki →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
