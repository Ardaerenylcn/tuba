import { db } from "@/lib/db";
import { ok, forbidden, serverError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

async function checkAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "admin" && session.user.role !== "editor") return null;
  return session;
}

export async function GET() {
  const session = await checkAdmin();
  if (!session) return forbidden();

  try {
    const cards = await db.giftCard.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { reservations: true } } },
    });
    return ok(
      cards.map((c) => ({
        id: c.id,
        code: c.code,
        initialValue: Number(c.initialValue),
        balance: Number(c.balance),
        currency: c.currency,
        purchaserName: c.purchaserName,
        purchaserEmail: c.purchaserEmail,
        recipientName: c.recipientName,
        recipientEmail: c.recipientEmail,
        message: c.message,
        status: c.status,
        expiresAt: c.expiresAt.toISOString(),
        createdAt: c.createdAt.toISOString(),
        usedCount: c._count.reservations,
      })),
    );
  } catch (err) {
    console.error("[GET /api/v1/admin/gift-cards]", err);
    return serverError();
  }
}
