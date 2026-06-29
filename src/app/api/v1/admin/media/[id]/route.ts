import { db } from "@/lib/db";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { ok, forbidden, serverError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

async function checkAdmin() {
  const session = await getSession();
  if (!session) return null;
  const role = (session.user as { role: string }).role;
  if (role !== "admin" && role !== "editor") return null;
  return session;
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await checkAdmin();
  if (!session) return forbidden();

  const { id } = await params;

  const media = await db.media.findUnique({ where: { id } });
  if (!media) return ok(null, "Zaten silinmiş.");

  // Extract storage path from URL: everything after /object/public/media/
  const match = media.url.match(/\/object\/public\/media\/(.+)$/);
  if (match) {
    const supabase = createSupabaseAdmin();
    await supabase.storage.from("media").remove([match[1]]).catch(() => {});
  }

  try {
    await db.media.delete({ where: { id } });
    return ok(null, "Görsel silindi.");
  } catch (err) {
    console.error("[media delete]", err);
    return serverError();
  }
}
