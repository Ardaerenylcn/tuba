import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) redirect("/giris");
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/giris?redirect=/admin");
  if (session.user.role !== "admin" && session.user.role !== "editor") {
    redirect("/");
  }
  return session;
}
