import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { rateLimit, getClientIp, sweep } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  subject: z.string().max(100).optional(),
  message: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  sweep();
  const rl = rateLimit(`contact:${getClientIp(req)}`, 5, 10 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Çok fazla istek. Lütfen biraz sonra tekrar deneyin." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Lütfen tüm zorunlu alanları doldurun." }, { status: 400 });
  }

  const { name, email, phone, subject, message } = parsed.data;

  if (env.RESEND_API_KEY && env.RESEND_FROM_EMAIL) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(env.RESEND_API_KEY);

      await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: env.RESEND_FROM_EMAIL,
        replyTo: email,
        subject: `[İletişim] ${subject ?? "Yeni mesaj"} — ${name}`,
        text: [
          `Ad Soyad: ${name}`,
          `E-posta: ${email}`,
          `Telefon: ${phone ?? "—"}`,
          `Konu: ${subject ?? "—"}`,
          ``,
          `Mesaj:`,
          message,
        ].join("\n"),
      });
    } catch (err) {
      console.error("Contact email error:", err);
      // Don't fail the request if email fails — still acknowledge receipt
    }
  }

  return NextResponse.json({ ok: true });
}
