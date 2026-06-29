import { db } from "@/lib/db";
import { forbidden, serverError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

function esc(v: unknown) {
  const s = String(v ?? "").replace(/"/g, '""');
  return `"${s}"`;
}

export async function GET() {
  const session = await getSession();
  if (!session || (session.user.role !== "admin" && session.user.role !== "editor")) return forbidden();

  try {
    const reservations = await db.reservation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        session: {
          include: { program: { select: { title: true, type: true } } },
        },
      },
    });

    const header = ["Ad Soyad", "E-posta", "Telefon", "Program", "Tür", "Tarih", "Saat", "Katılımcı", "Birim Fiyat", "İndirim", "Durum", "Oluşturulma"].join(",");

    const rows = reservations.map((r) => {
      const startAt = r.session?.startAt ? new Date(r.session.startAt) : null;
      return [
        esc(r.customerName),
        esc(r.customerEmail),
        esc(r.customerPhone),
        esc(r.session?.program?.title ?? ""),
        esc(r.session?.program?.type === "workshop" ? "Atölye" : "Sertifika"),
        esc(startAt ? startAt.toLocaleDateString("tr-TR") : ""),
        esc(startAt ? startAt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : ""),
        esc(r.participantCount),
        esc(Number(r.priceSnapshot).toLocaleString("tr-TR")),
        esc(r.discountAmount ? Number(r.discountAmount).toLocaleString("tr-TR") : ""),
        esc(r.status),
        esc(new Date(r.createdAt).toLocaleDateString("tr-TR")),
      ].join(",");
    });

    const csv = "﻿" + [header, ...rows].join("\r\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="rezervasyonlar-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error("[export/reservations]", err);
    return serverError();
  }
}
