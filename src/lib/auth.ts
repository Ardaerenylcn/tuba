import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
      const { env } = await import("@/lib/env");
      if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
        console.log(`[password-reset] Token URL: ${url}`);
        return;
      }
      const { Resend } = await import("resend");
      const resend = new Resend(env.RESEND_API_KEY);
      await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: user.email,
        subject: "Atölye Biz — Şifre Sıfırlama",
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
