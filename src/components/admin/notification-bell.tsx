"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Notif {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const POLL_MS = 30000;

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "az önce";
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} saat önce`;
  const d = Math.floor(h / 24);
  return `${d} gün önce`;
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const prevUnread = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success) return;
      setItems(data.data.items);
      const count = data.data.unreadCount as number;
      // Yeni bildirim geldiyse tarayıcı bildirimi (izin verilmişse)
      if (count > prevUnread.current && prevUnread.current !== 0 && typeof Notification !== "undefined" && Notification.permission === "granted") {
        const latest = data.data.items.find((n: Notif) => !n.read);
        if (latest) new Notification(latest.title, { body: latest.body });
      }
      prevUnread.current = count;
      setUnread(count);
    } catch { /* sessiz geç */ }
  }, []);

  useEffect(() => {
    // Polling ile bildirimleri periyodik çek (setState async fetch sonrası olur)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const t = setInterval(load, POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function markRead(id: string) {
    await fetch("/api/v1/admin/notifications/read", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
  }

  async function markAll() {
    await fetch("/api/v1/admin/notifications/read", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }),
    });
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    prevUnread.current = 0;
  }

  function openBell() {
    const next = !open;
    setOpen(next);
    if (next && typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }

  async function clickItem(n: Notif) {
    if (!n.read) {
      await markRead(n.id);
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
      prevUnread.current = Math.max(0, prevUnread.current - 1);
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={openBell}
        aria-label="Bildirimler"
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5" aria-hidden>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 max-w-[calc(100vw-2rem)] border border-[var(--border)] bg-[var(--surface)] shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
            <p className="text-xs font-semibold text-[var(--text-primary)]">Bildirimler</p>
            {unread > 0 && (
              <button onClick={markAll} className="text-[11px] text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text-primary)]">
                Tümünü okundu işaretle
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-10 text-center text-xs text-[var(--text-muted)]">Bildirim yok.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => clickItem(n)}
                  className={`flex w-full flex-col gap-0.5 border-b border-[var(--border)] px-4 py-3 text-left transition-colors hover:bg-[var(--bg-subtle)] ${n.read ? "" : "bg-[var(--bg-subtle)]"}`}
                >
                  <div className="flex items-center gap-2">
                    {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />}
                    <span className="text-xs font-medium text-[var(--text-primary)]">{n.title}</span>
                    <span className="ml-auto shrink-0 text-[10px] text-[var(--text-muted)]">{relTime(n.createdAt)}</span>
                  </div>
                  <p className="text-[11px] leading-snug text-[var(--text-secondary)]">{n.body}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
