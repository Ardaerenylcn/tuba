import { z } from "zod";
import { db } from "@/lib/db";
import { ok, created, badRequest, forbidden, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const reviewSchema = z.object({
  authorName: z.string().min(2).max(100),
  displayName: z.string().max(100).optional().nullable(),
  avatarUrl: z.string().url().max(500).optional().nullable().or(z.literal("")),
  rating: z.number().int().min(1).max(5).default(5),
  body: z.string().min(3).max(2000),
  programId: z.string().optional().nullable().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]).default("published"),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
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
    const reviews = await db.review.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { program: { select: { title: true } } },
    });
    return ok(reviews);
  } catch (err) {
    console.error("[GET /api/v1/admin/reviews]", err);
    return serverError();
  }
}

export async function POST(request: Request) {
  const session = await checkAdmin();
  if (!session) return forbidden();

  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz istek."); }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);
  const d = parsed.data;

  try {
    const review = await db.review.create({
      data: {
        authorName: d.authorName,
        displayName: d.displayName || null,
        avatarUrl: d.avatarUrl || null,
        rating: d.rating,
        body: d.body,
        programId: d.programId || null,
        status: d.status,
        featured: d.featured,
        sortOrder: d.sortOrder,
      },
      include: { program: { select: { title: true } } },
    });
    return created(review, "Yorum eklendi.");
  } catch (err) {
    console.error("[POST /api/v1/admin/reviews]", err);
    return serverError();
  }
}
