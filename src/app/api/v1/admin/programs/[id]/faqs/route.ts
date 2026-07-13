import { z } from "zod";
import { db } from "@/lib/db";
import { ok, created, badRequest, forbidden, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const createSchema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(2000),
  sortOrder: z.number().int().min(0).default(0),
});

async function checkAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "admin" && session.user.role !== "editor") return null;
  return session;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAdmin();
  if (!auth) return forbidden();

  const { id } = await params;
  const faqs = await db.programFaq.findMany({
    where: { programId: id },
    orderBy: { sortOrder: "asc" },
  });
  return ok(faqs);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAdmin();
  if (!auth) return forbidden();

  const { id } = await params;
  const program = await db.program.findUnique({ where: { id }, select: { id: true } });
  if (!program) return badRequest("Program bulunamadı.");

  let body: unknown;
  try { body = await req.json(); } catch { return badRequest("Geçersiz JSON."); }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const faq = await db.programFaq.create({
    data: { programId: id, ...parsed.data },
  });
  return created(faq);
}
