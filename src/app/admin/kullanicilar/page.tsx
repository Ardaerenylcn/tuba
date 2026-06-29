import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-server";
import { UserTable } from "./client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kullanıcılar | Admin" };

export default async function AdminUsersPage() {
  const session = await requireAdmin();
  const currentUserId = (session.user as { id: string }).id;

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-medium text-[var(--text-primary)]">Kullanıcılar</h1>
        <p className="text-sm text-[var(--text-muted)]">{users.length} kullanıcı</p>
      </div>

      {users.length === 0 ? (
        <div className="flex items-center justify-center py-16 border border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)]">Henüz kayıtlı kullanıcı yok.</p>
        </div>
      ) : (
        <UserTable users={users} currentUserId={currentUserId} />
      )}
    </div>
  );
}
