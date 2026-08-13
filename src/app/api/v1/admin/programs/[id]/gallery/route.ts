import { z } from "zod";
import { db } from "@/lib/db";
import { ok, created, badRequest, forbidden, handleZodError, serverError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const createSchema = z.object({
  url: z.string().min(1),
  mediaId: z.string().optional().nullable(),
});

/** Sıra ve aktiflik tek istekte kaydedilir — sürükle-bırak sonrası tüm liste gönderilir. */
const reorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        sortOrder: z.number().int().min(0),
        isActive: z.boolean(),
      }),
    )
    .max(200),
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
  const images = await db.programGalleryImage.findMany({
    where: { programId: id },
    orderBy: { sortOrder: "asc" },
  });
  return ok(images);
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

  try {
    // Yeni görsel listenin sonuna eklenir.
    const last = await db.programGalleryImage.findFirst({
      where: { programId: id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const image = await db.programGalleryImage.create({
      data: {
        programId: id,
        url: parsed.data.url,
        mediaId: parsed.data.mediaId ?? null,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });
    return created(image);
  } catch (err) {
    console.error("[POST /api/v1/admin/programs/:id/gallery]", err);
    return serverError();
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAdmin();
  if (!auth) return forbidden();

  const { id } = await params;

  let body: unknown;
  try { body = await req.json(); } catch { return badRequest("Geçersiz JSON."); }

  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error);

  const { items } = parsed.data;
  if (items.length === 0) return ok(null, "Değişiklik yok.");

  try {
    // Gelen id'lerin gerçekten bu programa ait olduğunu doğrula — aksi hâlde
    // başka bir programın görselleri güncellenebilirdi.
    const owned = await db.programGalleryImage.findMany({
      where: { programId: id, id: { in: items.map((i) => i.id) } },
      select: { id: true },
    });
    if (owned.length !== items.length) return badRequest("Geçersiz görsel listesi.");

    await db.$transaction(
      items.map((item) =>
        db.programGalleryImage.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder, isActive: item.isActive },
        }),
      ),
    );
    return ok(null, "Galeri güncellendi.");
  } catch (err) {
    console.error("[PUT /api/v1/admin/programs/:id/gallery]", err);
    return serverError();
  }
}
