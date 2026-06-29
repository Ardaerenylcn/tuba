import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center border-b border-[var(--border)] px-6">
        <Link
          href="/"
          className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--text-primary)]"
        >
          Atölye Biz
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        {children}
      </main>
    </div>
  );
}
