import { env } from "@/lib/env";

// Karışması kolay karakterler çıkarıldı (0/O, 1/I, vb.)
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomBlock(len: number): string {
  let s = "";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < len; i++) s += ALPHABET[bytes[i] % ALPHABET.length];
  return s;
}

/** TUBA-XXXX-XXXX biçiminde hediye kartı kodu üretir. */
export function generateGiftCardCode(): string {
  return `TUBA-${randomBlock(4)}-${randomBlock(4)}`;
}

export function formatTRY(value: number): string {
  return `${value.toLocaleString("tr-TR")} ₺`;
}

function formatDateTR(d: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul",
  }).format(d);
}

interface GiftCardEmailData {
  code: string;
  value: number;
  purchaserName: string;
  purchaserEmail: string;
  recipientName: string;
  recipientEmail: string;
  message?: string | null;
  expiresAt: Date;
}

function recipientEmailHtml(g: GiftCardEmailData): string {
  const siteUrl = env.NEXT_PUBLIC_APP_URL ?? "https://tubaatman.com";
  return `
  <div style="max-width:560px;margin:0 auto;font-family:Georgia,serif;color:#2c1810;background:#faf7f2;padding:32px 24px;">
    <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9c8b7a;margin:0 0 8px;">Tuba Atman Jewelry</p>
    <h1 style="font-size:26px;font-weight:400;margin:0 0 24px;">E-Hediye Kartınız 🎁</h1>
    <p style="font-size:15px;line-height:1.7;margin:0 0 20px;">
      Merhaba <strong>${g.recipientName}</strong>,<br/>
      <strong>${g.purchaserName}</strong> size Tuba Atman Jewelry atölyelerinde kullanabileceğiniz bir e-hediye kartı gönderdi.
    </p>
    ${g.message ? `<div style="border-left:3px solid #c9a97a;padding:8px 16px;margin:0 0 20px;font-style:italic;color:#5c4a3a;">"${g.message}"</div>` : ""}
    <div style="border:1px solid #e5ddd3;background:#fff;border-radius:8px;padding:24px;text-align:center;margin:0 0 24px;">
      <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9c8b7a;margin:0 0 6px;">Hediye Kartı Tutarı</p>
      <p style="font-size:34px;font-weight:500;margin:0 0 16px;">${formatTRY(g.value)}</p>
      <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9c8b7a;margin:0 0 6px;">Kod</p>
      <p style="font-size:22px;letter-spacing:3px;font-family:monospace;margin:0;">${g.code}</p>
    </div>
    <p style="font-size:14px;line-height:1.7;margin:0 0 20px;">
      Bu hediyeyi kullanmak için <a href="${siteUrl}/takvim" style="color:#2c1810;">takvimden</a> size uygun bir atölye ve tarih seçin;
      rezervasyon adımında yukarıdaki kodu girmeniz yeterli. Kartınız
      <strong>${formatDateTR(g.expiresAt)}</strong> tarihine kadar geçerlidir.
    </p>
    <a href="${siteUrl}/takvim" style="display:inline-block;background:#2c1810;color:#faf7f2;text-decoration:none;padding:12px 28px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">Atölye Seç →</a>
    <p style="font-size:12px;color:#9c8b7a;margin:28px 0 0;">Tuba Atman Jewelry · Moda Caddesi No:42, Kadıköy, İstanbul</p>
  </div>`;
}

function purchaserEmailHtml(g: GiftCardEmailData): string {
  return `
  <div style="max-width:560px;margin:0 auto;font-family:Georgia,serif;color:#2c1810;background:#faf7f2;padding:32px 24px;">
    <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9c8b7a;margin:0 0 8px;">Tuba Atman Jewelry</p>
    <h1 style="font-size:24px;font-weight:400;margin:0 0 20px;">Hediye kartınız gönderildi ✓</h1>
    <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">
      Merhaba <strong>${g.purchaserName}</strong>,<br/>
      <strong>${g.recipientName}</strong> (${g.recipientEmail}) adına aldığınız
      <strong>${formatTRY(g.value)}</strong> tutarındaki e-hediye kartı e-posta ile iletildi.
    </p>
    <p style="font-size:14px;line-height:1.7;margin:0 0 8px;">Kart kodu: <strong style="font-family:monospace;letter-spacing:2px;">${g.code}</strong></p>
    <p style="font-size:14px;line-height:1.7;margin:0;">Geçerlilik: <strong>${formatDateTR(g.expiresAt)}</strong></p>
    <p style="font-size:12px;color:#9c8b7a;margin:28px 0 0;">Bizi tercih ettiğiniz için teşekkür ederiz.</p>
  </div>`;
}

/** Alıcıya hediye kartı, satın alana onay e-postası gönderir. Hata olursa sessizce yutar. */
export async function sendGiftCardEmails(g: GiftCardEmailData): Promise<void> {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) return;
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(env.RESEND_API_KEY);

    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: g.recipientEmail,
      replyTo: g.purchaserEmail,
      subject: `🎁 ${g.purchaserName} size bir hediye gönderdi — Tuba Atman Jewelry`,
      html: recipientEmailHtml(g),
    });

    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: g.purchaserEmail,
      subject: `Hediye kartınız gönderildi — Tuba Atman Jewelry`,
      html: purchaserEmailHtml(g),
    });
  } catch (err) {
    console.error("[gift-card email]", err);
  }
}
