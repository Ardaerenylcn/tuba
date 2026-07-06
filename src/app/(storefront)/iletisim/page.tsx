import type { Metadata } from "next";
import { IletisimContent } from "./content";
import { getSettings } from "@/lib/settings";
import { getAllSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "İletişim | Atölye Biz",
  description:
    "Atölye Biz ile iletişime geçin. Rezervasyon, program ve özel etkinlik sorularınız için.",
};

export default async function IletisimPage() {
  const [{ mapEmbedUrl }, siteContent] = await Promise.all([
    getSettings(),
    getAllSiteContent(),
  ]);
  return (
    <IletisimContent
      mapEmbedUrl={mapEmbedUrl ?? null}
      config={siteContent.contact_info}
    />
  );
}
