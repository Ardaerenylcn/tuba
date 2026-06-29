"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
}

const ROLES = [
  { value: "customer", label: "Müşteri" },
  { value: "instructor", label: "Eğitmen" },
  { value: "editor", label: "Editör" },
  { value: "admin", label: "Admin" },
];

const ROLE_COLORS: Record<string, string> = {
  customer: "text-[var(--text-muted)]",
  instructor: "text-blue-700",
  editor: "text-amber-700",
  admin: "text-[var(--text-primary)] font-medium",
};

function UserRow({ user, isSelf }: { user: User; isSelf: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function patch(data: object) {
    setLoading(true);
    await fetch(`/api/v1/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <tr className="hover:bg-[var(--bg-subtle)]">
      <td className="px-4 py-3">
        <p className="font-medium text-[var(--text-primary)]">{user.name}</p>
        <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
        {user.phone && <p className="text-xs text-[var(--text-disabled)]">{user.phone}</p>}
      </td>
      <td className="px-4 py-3">
        {isSelf ? (
          <span className={`text-sm ${ROLE_COLORS[user.role]}`}>
            {ROLES.find((r) => r.value === user.role)?.label ?? user.role}
          </span>
        ) : (
          <select
            value={user.role}
            disabled={loading}
            onChange={(e) => patch({ role: e.target.value })}
            className="border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none disabled:opacity-50"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 text-xs ${user.isActive ? "text-green-700" : "text-red-600"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? "bg-green-600" : "bg-red-500"}`} />
          {user.isActive ? "Aktif" : "Pasif"}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs ${user.emailVerified ? "text-green-700" : "text-[var(--text-disabled)]"}`}>
          {user.emailVerified ? "Onaylı" : "Onaysız"}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
        {new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Istanbul" }).format(new Date(user.createdAt))}
      </td>
      <td className="px-4 py-3">
        {!isSelf && (
          <button
            onClick={() => patch({ isActive: !user.isActive })}
            disabled={loading}
            className="text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)] disabled:opacity-50"
          >
            {user.isActive ? "Pasifleştir" : "Aktifleştir"}
          </button>
        )}
      </td>
    </tr>
  );
}

export function UserTable({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  return (
    <div className="border border-[var(--border)] bg-[var(--surface)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {["Kullanıcı", "Rol", "Durum", "E-posta", "Kayıt", "İşlem"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {users.map((u) => (
              <UserRow key={u.id} user={u} isSelf={u.id === currentUserId} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
