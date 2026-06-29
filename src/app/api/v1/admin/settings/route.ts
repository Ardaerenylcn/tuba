import { db } from "@/lib/db";
import { ok, badRequest, forbidden, serverError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const KEY = "site.settings";
const LOCALE = "tr";

async function checkAdmin() {
  const session = await getSession();
  if (!session) return null;
  const role = (session.user as { role: string }).role;
  if (role !== "admin" && role !== "editor") return null;
  return session;
}

export async function GET() {
  const session = await checkAdmin();
  if (!session) return forbidden();

  const row = await db.siteContent.findUnique({
    where: { key_locale: { key: KEY, locale: LOCALE } },
  });

  return ok(row?.value ?? null);
}

export async function PUT(request: Request) {
  const session = await checkAdmin();
  if (!session) return forbidden();

  let body: unknown;
  try { body = await request.json(); } catch { return badRequest("Geçersiz JSON."); }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return badRequest("Geçersiz veri.");
  }

  try {
    await db.siteContent.upsert({
      where: { key_locale: { key: KEY, locale: LOCALE } },
      update: { value: body as object, status: "published", updatedBy: (session.user as { id: string }).id },
      create: { key: KEY, locale: LOCALE, value: body as object, status: "published", updatedBy: (session.user as { id: string }).id },
    });
    return ok(null, "Ayarlar kaydedildi.");
  } catch (err) {
    console.error("[settings]", err);
    return serverError();
  }
}
