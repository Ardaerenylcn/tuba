import { db } from "@/lib/db";
import { SettingsForm } from "./client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ayarlar | Admin" };

export default async function AdminSettingsPage() {
  const row = await db.siteContent.findUnique({
    where: { key_locale: { key: "site.settings", locale: "tr" } },
  });

  const initial =
    row?.value && typeof row.value === "object" && !Array.isArray(row.value)
      ? (row.value as Record<string, string>)
      : null;

  return <SettingsForm initial={initial} />;
}
