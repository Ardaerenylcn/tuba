import { db } from "@/lib/db";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { ok, badRequest, forbidden, serverError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const BUCKET = "media";
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

async function checkAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "admin" && session.user.role !== "editor") return null;
  return session;
}

export async function POST(request: Request) {
  const session = await checkAdmin();
  if (!session) return forbidden();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return badRequest("Geçersiz form verisi.");
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) return badRequest("Dosya bulunamadı.");

  if (!ALLOWED_TYPES.includes(file.type)) {
    return badRequest("Yalnızca JPEG, PNG, WebP ve GIF destekleniyor.");
  }
  if (file.size > MAX_SIZE) {
    return badRequest("Dosya 10 MB'dan büyük olamaz.");
  }

  const fileName = file instanceof File ? file.name : "upload";
  // Uzantıyı kullanıcı dosya adından değil, doğrulanmış mime tipinden türet (güvenlik).
  const EXT_BY_TYPE: Record<string, string> = {
    "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
  };
  const ext = EXT_BY_TYPE[file.type] ?? "jpg";
  const storagePath = `programs/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = createSupabaseAdmin();

  // Bucket'ı oluştur (zaten varsa hata vermez)
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("[upload] Supabase storage error:", uploadError);
    return serverError("Dosya yüklenemedi.");
  }

  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  try {
    const media = await db.media.create({
      data: {
        fileName: fileName,
        url: publicUrl.publicUrl,
        mimeType: file.type,
        sizeBytes: file.size,
      },
    });

    return ok(media, "Görsel yüklendi.");
  } catch (err) {
    console.error("[upload] DB error:", err);
    // Supabase'den sil
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return serverError();
  }
}
