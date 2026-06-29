import { z } from "zod";
import { db } from "@/lib/db";
import { ok, created, badRequest, forbidden, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const schema = z.object({
  code: z.string().min(3).max(30).toUpperCase(),
  type: z.enum(["percent", "fixed"]),
  value: z.number().positive(),
  maxUses: z.number().int().positive().optional().nullable(),
  minOrderAmount: z.number().min(0).optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  active: z.boolean().default(true),
});

async function checkAdmin() {
  const session = await getSession();
  if (!session || (session.user.role !== "admin" && session.user.role !== "editor")) return null;
  return session;
}

export async function GET() {
  if (!await checkAdmin()) return forbidden();
  try {
    const codes = await db.discountCode.findMany({ orderBy: { createdAt: "desc" } });
    return ok(codes);
  } catch (err) {
    console.error("[discount-codes GET]", err);
    return serverError();
  }
}

export async function POST(request: Request) {
  if (!await checkAdmin()) return forbidden();
  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek."); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  try {
    const existing = await db.discountCode.findUnique({ where: { code: parsed.data.code } });
    if (existing) return badRequest("Bu kod zaten kullanımda.");
    const code = await db.discountCode.create({
      data: {
        ...parsed.data,
        value: parsed.data.value,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      },
    });
    return created(code, "Kod oluşturuldu.");
  } catch (err) {
    console.error("[discount-codes POST]", err);
    return serverError();
  }
}
