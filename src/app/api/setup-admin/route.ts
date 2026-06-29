import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  if (secret !== "tuba-setup-2026") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { hashPassword } = await import("@better-auth/utils/password");

  const email = "admin@tubaatolyesi.com";
  const password = "admin123456";
  const hashed = await hashPassword(password);

  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    await db.account.updateMany({
      where: { userId: existing.id, providerId: "credential" },
      data: { password: hashed },
    });
    await db.user.update({ where: { id: existing.id }, data: { role: "admin" } });
    return NextResponse.json({ ok: true, action: "updated" });
  }

  const user = await db.user.create({
    data: { email, name: "Admin", role: "admin", emailVerified: true },
  });
  await db.account.create({
    data: {
      userId: user.id,
      accountId: user.id,
      providerId: "credential",
      password: hashed,
    },
  });

  return NextResponse.json({ ok: true, action: "created" });
}
