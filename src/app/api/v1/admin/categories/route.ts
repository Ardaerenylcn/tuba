import { z } from "zod";
import { db } from "@/lib/db";
import { ok, created, badRequest, forbidden, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug yalnızca küçük harf, rakam ve tire içerebilir"),
  description: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().default(0),
  showOnHome: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

async function checkAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "admin" && session.user.role !== "editor") return null;
  return session;
}

export async function GET() {
  const session = await checkAdmin();
  if (!session) return forbidden();

  try {
    const categories = await db.programCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { programs: true } } },
    });
    return ok(categories);
  } catch (err) {
    console.error("[GET /api/v1/admin/categories]", err);
    return serverError();
  }
}

export async function POST(request: Request) {
  const session = await checkAdmin();
  if (!session) return forbidden();

  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek."); }

  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  try {
    const existing = await db.programCategory.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) return badRequest("Bu slug zaten kullanımda.");

    const category = await db.programCategory.create({ data: parsed.data });
    return created(category, "Tür oluşturuldu.");
  } catch (err) {
    console.error("[POST /api/v1/admin/categories]", err);
    return serverError();
  }
}
