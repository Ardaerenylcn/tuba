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
    const users = await db.user.findMany({
      where: { role: { in: ["customer", "instructor"] } },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { reservations: true } },
        reservations: { select: { priceSnapshot: true, participantCount: true } },
      },
    });

    const header = ["Ad Soyad", "E-posta", "Telefon", "Rol", "Rezervasyon", "Toplam Harcama", "Kayıt Tarihi"].join(",");

    const rows = users.map((u) => {
      const total = u.reservations.reduce((sum, r) => sum + Number(r.priceSnapshot) * r.participantCount, 0);
      return [
        esc(u.name),
        esc(u.email),
        esc(u.phone ?? ""),
        esc(u.role === "instructor" ? "Eğitmen" : "Müşteri"),
        esc(u._count.reservations),
        esc(total.toLocaleString("tr-TR")),
        esc(new Date(u.createdAt).toLocaleDateString("tr-TR")),
      ].join(",");
    });

    const csv = "﻿" + [header, ...rows].join("\r\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="musteriler-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error("[export/customers]", err);
    return serverError();
  }
}
