import { getSession } from "@/lib/auth-server";

export async function AdminHeader() {
  const session = await getSession();

  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6">
      <div />
      <div className="flex items-center gap-3">
        <span className="text-xs text-[var(--text-muted)]">{session?.user.email}</span>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-muted)] text-xs font-medium text-[var(--text-primary)]">
          {session?.user.name?.charAt(0).toUpperCase() ?? "?"}
        </div>
      </div>
    </header>
  );
}
