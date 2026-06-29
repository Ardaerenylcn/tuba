import type { Metadata } from "next";
import { IletisimContent } from "./content";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "İletişim | Atölye Biz",
  description:
    "Atölye Biz ile iletişime geçin. Rezervasyon, program ve özel etkinlik sorularınız için.",
};

export default async function IletisimPage() {
  const { mapEmbedUrl } = await getSettings();
  return <IletisimContent mapEmbedUrl={mapEmbedUrl ?? null} />;
}
