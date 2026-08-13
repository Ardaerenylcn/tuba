import { db } from "@/lib/db";
import { ok, forbidden, notFound, serverError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

async function checkAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "admin" && session.user.role !== "editor") return null;
  return session;
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  const auth = await checkAdmin();
  if (!auth) return forbidden();

  const { id, imageId } = await params;

  try {
    // Görselin bu programa ait olduğunu doğrula.
    const existing = await db.programGalleryImage.findFirst({
      where: { id: imageId, programId: id },
      select: { id: true },
    });
    if (!existing) return notFound("Görsel bulunamadı.");

    // Yalnızca galeri bağı silinir; Media kaydı ve depodaki dosya korunur
    // (aynı dosya başka yerde de kullanılabilir).
    await db.programGalleryImage.delete({ where: { id: imageId } });
    return ok(null, "Görsel kaldırıldı.");
  } catch (err) {
    console.error("[DELETE /api/v1/admin/programs/:id/gallery/:imageId]", err);
    return serverError();
  }
}
