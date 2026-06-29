import type { Metadata } from "next";
import { HakkimizdaContent } from "./content";

export const metadata: Metadata = {
  title: "Hakkımızda | Atölye Biz",
  description:
    "Atölye Biz, İstanbul'da kuyumculuk ve mücevher eğitimleri sunan takı tasarım atölyesidir.",
};

export default function HakkimizdaPage() {
  return <HakkimizdaContent />;
}
