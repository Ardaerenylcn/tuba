import { db } from "@/lib/db";

/** Oturuma eğitmen atanabilecek roller. */
const INSTRUCTOR_ROLES = ["instructor", "admin", "editor"] as const;

/**
 * Verilen kullanıcının oturuma eğitmen olarak atanabileceğini doğrular.
 *
 * `null` gönderilmesi "eğitmen atanmamış" demektir ve geçerlidir. Geçersiz
 * bir kimlik için hata mesajı döner; böylece uçlar sessizce yanlış veri
 * yazmaz (eğitmen çakışma kontrolü buna güveniyor).
 */
export async function validateInstructor(
  instructorId: string | null | undefined,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (instructorId === undefined || instructorId === null || instructorId === "") return { ok: true };

  const user = await db.user.findUnique({
    where: { id: instructorId },
    select: { role: true, isActive: true },
  });
  if (!user) return { ok: false, message: "Eğitmen bulunamadı." };
  if (!user.isActive) return { ok: false, message: "Eğitmen hesabı pasif." };
  if (!(INSTRUCTOR_ROLES as readonly string[]).includes(user.role)) {
    return { ok: false, message: "Bu kullanıcı eğitmen olarak atanamaz." };
  }
  return { ok: true };
}
