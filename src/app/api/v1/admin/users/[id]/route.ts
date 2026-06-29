import { db } from "@/lib/db";
import { ok, badRequest, forbidden, serverError } from "@/lib/api";
import { getSession } from "@/lib/auth-server";

const ALLOWED_ROLES = ["customer", "instructor", "editor", "admin"] as const;
type Role = (typeof ALLOWED_ROLES)[number];

async function checkAdmin() {
  const session = await getSession();
  if (!session) return null;
  const role = (session.user as { role: string }).role;
  if (role !== "admin") return null; // only admin can change roles
  return session;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await checkAdmin();
  if (!session) return forbidden();

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Geçersiz istek.");

  const { role, isActive } = body as { role?: string; isActive?: boolean };

  if (role !== undefined && !ALLOWED_ROLES.includes(role as Role)) {
    return badRequest("Geçersiz rol.");
  }

  // Prevent self-demotion
  if ((session.user as { id: string }).id === id && role && role !== "admin") {
    return badRequest("Kendi rolünüzü değiştiremezsiniz.");
  }

  try {
    const user = await db.user.update({
      where: { id },
      data: {
        ...(role !== undefined && { role: role as Role }),
        ...(isActive !== undefined && { isActive }),
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
    return ok(user, "Kullanıcı güncellendi.");
  } catch (err) {
    console.error("[users patch]", err);
    return serverError();
  }
}
