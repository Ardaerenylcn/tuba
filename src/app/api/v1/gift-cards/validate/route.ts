import { db } from "@/lib/db";
import { ok, badRequest, serverError } from "@/lib/api";

/** Rezervasyon sırasında hediye kartı kodunu doğrular ve uygulanabilir tutarı döner. */
export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek."); }

  const { code, orderAmount } = body as { code?: string; orderAmount?: number };
  if (!code) return badRequest("Kod gerekli.");

  try {
    const card = await db.giftCard.findUnique({ where: { code: code.trim().toUpperCase() } });

    if (!card) return badRequest("Hediye kartı bulunamadı.");
    if (card.status === "cancelled") return badRequest("Bu hediye kartı iptal edilmiş.");
    if (card.status === "depleted" || Number(card.balance) <= 0) return badRequest("Bu hediye kartının bakiyesi kalmamış.");
    if (card.expiresAt < new Date()) return badRequest("Bu hediye kartının süresi dolmuş.");

    const balance = Number(card.balance);
    const applicable = orderAmount ? Math.min(balance, orderAmount) : balance;

    return ok(
      {
        code: card.code,
        balance,
        applicable,
        expiresAt: card.expiresAt.toISOString(),
      },
      "Hediye kartı geçerli.",
    );
  } catch (err) {
    console.error("[POST /api/v1/gift-cards/validate]", err);
    return serverError();
  }
}
