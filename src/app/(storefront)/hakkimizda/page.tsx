import type { Metadata } from "next";
import { getHakkimizdaConfig } from "@/lib/site-content";
import { HakkimizdaContent } from "./content";

export const metadata: Metadata = {
  title: "Hakkımızda | Atölye Biz",
  description:
    "Atölye Biz, İstanbul'da kuyumculuk ve mücevher eğitimleri sunan takı tasarım atölyesidir.",
};

export default async function HakkimizdaPage() {
  const config = await getHakkimizdaConfig();
  return <HakkimizdaContent config={config} />;
}
