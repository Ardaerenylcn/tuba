import { db } from "@/lib/db";

export interface SiteSettings {
  siteName?: string;
  phone?: string;
  email?: string;
  address?: string;
  whatsappNumber?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  mapEmbedUrl?: string;
}

export async function getSettings(): Promise<SiteSettings> {
  const row = await db.siteContent.findUnique({
    where: { key_locale: { key: "site.settings", locale: "tr" } },
  });
  if (!row?.value || typeof row.value !== "object" || Array.isArray(row.value)) return {};
  return row.value as SiteSettings;
}
