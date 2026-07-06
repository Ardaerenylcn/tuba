import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badRequest, forbidden, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";
import type { Prisma } from "@/generated/prisma";

const putSchema = z.object({
  value: z.record(z.string(), z.unknown()),
  status: z.enum(["draft", "published", "archived"]).default("published"),
  locale: z.string().default("tr"),
});

async function checkAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "admin" && session.user.role !== "editor") return null;
  return session;
}

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const session = await checkAdmin();
  if (!session) return forbidden();

  const { key } = await params;
  try {
    const entry = await db.siteContent.findUnique({ where: { key_locale: { key, locale: "tr" } } });
    return ok(entry ?? null);
  } catch (err) {
    console.error("[GET /api/v1/admin/site-content/:key]", err);
    return serverError();
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const session = await checkAdmin();
  if (!session) return forbidden();

  const { key } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek."); }

  const parsed = putSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const { value, status, locale } = parsed.data;

  try {
    const jsonValue = value as Prisma.InputJsonValue;
    const entry = await db.siteContent.upsert({
      where: { key_locale: { key, locale } },
      create: { key, locale, value: jsonValue, status, updatedBy: session.user.id },
      update: { value: jsonValue, status, updatedBy: session.user.id },
    });
    return ok(entry, "İçerik kaydedildi.");
  } catch (err) {
    console.error("[PUT /api/v1/admin/site-content/:key]", err);
    return serverError();
  }
}
