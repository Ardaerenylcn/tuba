import { db } from "@/lib/db";
import { ok, badRequest, serverError } from "@/lib/api";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek."); }

  const { code, orderAmount } = body as { code?: string; orderAmount?: number };
  if (!code) return badRequest("Kod gerekli.");

  try {
    const discount = await db.discountCode.findUnique({ where: { code: code.toUpperCase() } });

    if (!discount || !discount.active) return badRequest("Geçersiz veya aktif olmayan kod.");
    if (discount.expiresAt && discount.expiresAt < new Date()) return badRequest("Bu kodun süresi dolmuş.");
    if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) return badRequest("Bu kod kullanım limitine ulaştı.");
    if (discount.minOrderAmount && orderAmount && orderAmount < Number(discount.minOrderAmount)) {
      return badRequest(`Bu kod minimum ${Number(discount.minOrderAmount).toLocaleString("tr-TR")} ₺ sipariş için geçerlidir.`);
    }

    return ok({
      code: discount.code,
      type: discount.type,
      value: Number(discount.value),
    }, "Kod geçerli.");
  } catch (err) {
    console.error("[coupons]", err);
    return serverError();
  }
}
