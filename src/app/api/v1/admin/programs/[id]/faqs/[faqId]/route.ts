import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badRequest, forbidden, serverError, handleZodError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const patchSchema = z.object({
  question: z.string().min(1).max(500).optional(),
  answer: z.string().min(1).max(2000).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

async function checkAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "admin" && session.user.role !== "editor") return null;
  return session;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; faqId: string }> }) {
  const auth = await checkAdmin();
  if (!auth) return forbidden();

  const { id, faqId } = await params;
  const faq = await db.programFaq.findUnique({ where: { id: faqId } });
  if (!faq || faq.programId !== id) return badRequest("SSS maddesi bulunamadı.");

  let body: unknown;
  try { body = await req.json(); } catch { return badRequest("Geçersiz JSON."); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const updated = await db.programFaq.update({ where: { id: faqId }, data: parsed.data });
  return ok(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; faqId: string }> }) {
  const auth = await checkAdmin();
  if (!auth) return forbidden();

  const { id, faqId } = await params;
  const faq = await db.programFaq.findUnique({ where: { id: faqId } });
  if (!faq || faq.programId !== id) return badRequest("SSS maddesi bulunamadı.");

  await db.programFaq.delete({ where: { id: faqId } });
  return ok({ deleted: true });
}
