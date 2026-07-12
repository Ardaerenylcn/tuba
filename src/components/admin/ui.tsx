import type { ReactNode } from "react";

/** Tutarlı sayfa başlığı + isteğe bağlı aksiyon (sağda). */
export function AdminPageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-medium text-[var(--text-primary)]">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-[var(--text-muted)]">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Yüzey kartı (kenarlıklı konteyner). */
export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border border-[var(--border)] bg-[var(--surface)] ${className}`}>{children}</div>
  );
}

/** Yatay kaydırılabilir tablo sarmalayıcı (mobilde taşmayı önler). */
export function TableScroll({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto border border-[var(--border)] bg-[var(--surface)]">
      {children}
    </div>
  );
}

/** Boş durum. */
export function EmptyState({
  title,
  description,
  action,
  icon = "◆",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
      <span className="text-2xl text-[var(--text-disabled)]" aria-hidden>{icon}</span>
      <p className="text-sm text-[var(--text-secondary)]">{title}</p>
      {description && <p className="max-w-sm text-xs text-[var(--text-muted)]">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Hata durumu + tekrar dene. */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 border border-red-200 bg-red-50 px-6 py-12 text-center">
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="border border-red-300 px-4 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
        >
          Tekrar dene
        </button>
      )}
    </div>
  );
}

/** İskelet yükleme satırları. */
export function LoadingRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse border border-[var(--border)] bg-[var(--bg-subtle)]" />
      ))}
    </div>
  );
}

export type BadgeTone = "green" | "amber" | "red" | "blue" | "stone" | "orange";

const TONE_CLASSES: Record<BadgeTone, string> = {
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-600",
  blue: "bg-blue-50 text-blue-600",
  stone: "bg-stone-100 text-stone-600",
  orange: "bg-orange-50 text-orange-600",
};

/** Durum rozeti. */
export function StatusBadge({ label, tone = "stone" }: { label: string; tone?: BadgeTone }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs whitespace-nowrap ${TONE_CLASSES[tone]}`}>
      {label}
    </span>
  );
}
