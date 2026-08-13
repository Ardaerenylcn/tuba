import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { requireAdmin } from "@/lib/auth-server";
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Yetkilendirme tek çıkış noktasında. Önceden her sayfa kendi kontrolünü
  // yapıyordu ve bazıları (musteriler, dashboard) atlanmıştı; o sayfalar
  // oturum açmadan erişilebiliyor, müşteri verisi görünüyordu.
  await requireAdmin();

  return (
    <div className="admin-root flex min-h-screen bg-[var(--bg)]">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
