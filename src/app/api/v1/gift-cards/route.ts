import { z } from "zod";
import { db } from "@/lib/db";
import { created, badRequest, serverError, handleZodError } from "@/lib/api";
import { generateGiftCardCode, sendGiftCardEmails } from "@/lib/gift-card";

const MIN_AMOUNT = 500;
const MAX_AMOUNT = 100000;

const giftCardSchema = z.object({
  amount: z.coerce.number().int().min(MIN_AMOUNT).max(MAX_AMOUNT),
  recipientName: z.string().min(2).max(100),
  recipientEmail: z.string().email(),
  purchaserName: z.string().min(2).max(100),
  purchaserEmail: z.string().email(),
  message: z.string().max(500).optional().or(z.literal("")).transform((v) => v || undefined),
});

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek."); }

  const parsed = giftCardSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);
  const d = parsed.data;

  try {
    // Çakışma ihtimaline karşı benzersiz kod üret
    let code = generateGiftCardCode();
    for (let i = 0; i < 5; i++) {
      const exists = await db.giftCard.findUnique({ where: { code } });
      if (!exists) break;
      code = generateGiftCardCode();
    }

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const giftCard = await db.giftCard.create({
      data: {
        code,
        initialValue: d.amount,
        balance: d.amount,
        currency: "TRY",
        purchaserName: d.purchaserName,
        purchaserEmail: d.purchaserEmail,
        recipientName: d.recipientName,
        recipientEmail: d.recipientEmail,
        message: d.message ?? null,
        status: "active",
        expiresAt,
      },
    });

    // E-postaları arka planda gönder (başarısız olsa da satın almayı bozma)
    await sendGiftCardEmails({
      code: giftCard.code,
      value: d.amount,
      purchaserName: d.purchaserName,
      purchaserEmail: d.purchaserEmail,
      recipientName: d.recipientName,
      recipientEmail: d.recipientEmail,
      message: d.message,
      expiresAt,
    });

    return created(
      {
        id: giftCard.id,
        code: giftCard.code,
        value: Number(giftCard.initialValue),
        recipientName: giftCard.recipientName,
        recipientEmail: giftCard.recipientEmail,
        expiresAt: giftCard.expiresAt.toISOString(),
      },
      "Hediye kartı oluşturuldu.",
    );
  } catch (err) {
    console.error("[POST /api/v1/gift-cards]", err);
    return serverError();
  }
}
