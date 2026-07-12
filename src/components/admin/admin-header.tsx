import { getSession } from "@/lib/auth-server";
import { MobileMenu } from "./mobile-menu";
import { NotificationBell } from "./notification-bell";

export async function AdminHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 backdrop-blur sm:px-6">
      {/* Sol: mobil hamburger */}
      <div className="flex items-center gap-3">
        <MobileMenu />
      </div>

      {/* Sağ: bildirimler + kullanıcı bilgisi */}
      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="hidden h-5 w-px bg-[var(--border)] sm:block" />
        <div className="hidden flex-col items-end leading-tight sm:flex">
          <span className="text-xs font-medium text-[var(--text-primary)]">{session?.user.name}</span>
          <span className="text-[11px] text-[var(--text-muted)]">{session?.user.email}</span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--admin-rail)] text-xs font-medium text-white">
          {session?.user.name?.charAt(0).toUpperCase() ?? "?"}
        </div>
      </div>
    </header>
  );
}
