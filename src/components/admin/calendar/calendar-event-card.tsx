"use client";

import type { CalendarEvent } from "@/lib/calendar";
import { SESSION_STATUS_ACCENT, SESSION_STATUS_LABELS, occupancyTone } from "./status-labels";

function hhmm(iso: string) {
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Takvimdeki tek etkinlik bloğu. Ay görünümünde kompakt, gün/hafta/listede
 * daha ayrıntılı. Durum sol kenar rengiyle, doluluk sayı ile belli olur.
 */
export function CalendarEventCard({
  event,
  variant = "compact",
  onOpen,
  draggable = false,
}: {
  event: CalendarEvent;
  variant?: "compact" | "detailed";
  onOpen: (id: string) => void;
  draggable?: boolean;
}) {
  const accent = SESSION_STATUS_ACCENT[event.status] ?? SESSION_STATUS_ACCENT.draft;
  const isFull = event.booked >= event.capacity;

  return (
    <button
      type="button"
      onClick={() => onOpen(event.id)}
      draggable={draggable}
      // Sürüklenen etkinliğin kimliğini taşıyıcının kendisi bildirir; görünümler
      // ayrı bir state/ref tutmak zorunda kalmaz.
      onDragStart={(e) => e.dataTransfer.setData("text/plain", event.id)}
      title={`${event.programTitle} · ${hhmm(event.startAt)}–${hhmm(event.endAt)} · ${event.booked}/${event.capacity}`}
      className={`w-full border-l-2 px-1.5 py-1 text-left transition-opacity hover:opacity-80 ${accent} ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      {variant === "compact" ? (
        <span className="flex items-baseline gap-1 text-[10px] leading-tight">
          <span className="shrink-0 tabular-nums opacity-70">{hhmm(event.startAt)}</span>
          <span className="truncate font-medium">{event.programTitle}</span>
        </span>
      ) : (
        <span className="block">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-xs font-medium">{event.programTitle}</span>
            <span className="shrink-0 text-[10px] tabular-nums opacity-70">
              {hhmm(event.startAt)}–{hhmm(event.endAt)}
            </span>
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] opacity-80">
            <span className={`tabular-nums font-medium ${occupancyTone(event.booked, event.capacity)}`}>
              {event.booked}/{event.capacity} kişi
            </span>
            {isFull && <span className="text-amber-700">dolu</span>}
            {event.waitlisted > 0 && <span className="text-sky-700">+{event.waitlisted} bekleyen</span>}
            {event.instructorName && <span className="truncate">{event.instructorName}</span>}
            {event.locationName && <span className="truncate">{event.locationName}</span>}
            <span className="opacity-70">{SESSION_STATUS_LABELS[event.status] ?? event.status}</span>
          </span>
        </span>
      )}
    </button>
  );
}
