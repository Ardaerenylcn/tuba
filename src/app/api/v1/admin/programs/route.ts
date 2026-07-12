import { z } from "zod";
import { db } from "@/lib/db";
import { ok, created, badRequest, forbidden, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const programSchema = z.object({
  type: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, "Slug yalnızca küçük harf, rakam ve tire içerebilir"),
  shortDescription: z.string().min(10).max(500),
  description: z.any().default({}),
  basePrice: z.number().min(0),
  currency: z.string().default("TRY"),
  defaultCapacity: z.number().int().min(1).optional(),
  durationMinutes: z.number().int().min(1).optional(),
  level: z.enum(["beginner", "intermediate", "advanced", "all_levels"]).optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  coverImageId: z.string().optional().nullable(),
  coverImagePosition: z.string().optional().nullable(),
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
    const programs = await db.program.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { _count: { select: { sessions: true } } },
    });
    return ok(programs);
  } catch (err) {
    console.error("[GET /api/v1/admin/programs]", err);
    return serverError();
  }
}

export async function POST(request: Request) {
  const session = await checkAdmin();
  if (!session) return forbidden();

  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek."); }

  const parsed = programSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  try {
    const existing = await db.program.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) return badRequest("Bu slug zaten kullanımda.");

    const { coverImageId, categoryId, ...rest } = parsed.data;
    const program = await db.program.create({
      data: {
        ...rest,
        ...(coverImageId ? { coverImage: { connect: { id: coverImageId } } } : {}),
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
      },
    });

    await db.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: "program.create",
        entityType: "Program",
        entityId: program.id,
        newValue: program as any,
      },
    });

    return created(program, "Program oluşturuldu.");
  } catch (err) {
    console.error("[POST /api/v1/admin/programs]", err);
    return serverError();
  }
}
