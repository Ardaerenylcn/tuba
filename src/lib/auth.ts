import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

/**
 * Resend üzerinden düz metin e-posta gönderir.
 * RESEND_* değişkenleri tanımlı değilse (yerel geliştirme) bağlantıyı konsola yazar.
 */
async function sendMail({
  to,
  subject,
  text,
  logLabel,
  logUrl,
}: {
  to: string;
  subject: string;
  text: string;
  logLabel: string;
  logUrl: string;
}) {
  const { env } = await import("@/lib/env");
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    // Doğrulama girişin önkoşulu olduğu için prod'da sessizce yutmak,
    // kullanıcıya "bağlantı gönderdik" deyip hesabı kilitlemek anlamına gelir.
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `[${logLabel}] RESEND_API_KEY / RESEND_FROM_EMAIL tanımlı değil; e-posta gönderilemedi.`,
      );
    }
    console.log(`[${logLabel}] Token URL: ${logUrl}`);
    return;
  }
  const { Resend } = await import("resend");
  const resend = new Resend(env.RESEND_API_KEY);
  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject,
    text,
  });
}

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
      await sendMail({
        to: user.email,
        subject: "Atölye Biz — Şifre Sıfırlama",
        logLabel: "password-reset",
        logUrl: url,
        text: [
          `Merhaba ${user.name},`,
          ``,
          `Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:`,
          ``,
          url,
          ``,
          `Bu bağlantı 1 saat geçerlidir.`,
          `Eğer bu isteği siz yapmadıysanız bu e-postayı dikkate almayın.`,
          ``,
          `Atölye Biz`,
        ].join("\n"),
      });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24, // 24 saat
    sendVerificationEmail: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
      await sendMail({
        to: user.email,
        subject: "Atölye Biz — E-posta Adresinizi Doğrulayın",
        logLabel: "email-verification",
        logUrl: url,
        text: [
          `Merhaba ${user.name},`,
          ``,
          `Atölye Biz hesabınızı kullanmaya başlamak için e-posta adresinizi doğrulayın:`,
          ``,
          url,
          ``,
          `Bu bağlantı 24 saat geçerlidir.`,
          `Eğer bu hesabı siz oluşturmadıysanız bu e-postayı dikkate almayın.`,
          ``,
          `Atölye Biz`,
        ].join("\n"),
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      isActive: {
        type: "boolean",
        defaultValue: true,
        input: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
