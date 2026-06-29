import { db } from "@/lib/db";
import { ok, badRequest, forbidden, serverError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const KEY = "gallery.images";
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
  try {
    body = await request.json();
  } catch {
    return badRequest("Geçersiz JSON.");
  }

  const config = body as {
    layer1?: unknown;
    layer2?: unknown;
    layer3?: unknown;
    scaler?: unknown;
  };

  if (
    !Array.isArray(config.layer1) || config.layer1.length !== 6 ||
    !Array.isArray(config.layer2) || config.layer2.length !== 6 ||
    !Array.isArray(config.layer3) || config.layer3.length !== 2 ||
    typeof config.scaler !== "string"
  ) {
    return badRequest("Geçersiz galeri yapısı.");
  }

  try {
    await db.siteContent.upsert({
      where: { key_locale: { key: KEY, locale: LOCALE } },
      update: {
        value: config as object,
        status: "published",
        updatedBy: (session.user as { id: string }).id,
      },
      create: {
        key: KEY,
        locale: LOCALE,
        value: config as object,
        status: "published",
        updatedBy: (session.user as { id: string }).id,
      },
    });

    return ok(null, "Galeri görselleri kaydedildi.");
  } catch (err) {
    console.error("[gallery] DB error:", err);
    return serverError();
  }
}
