import type { Metadata } from "next";
import { SSSContent } from "./content";

export const metadata: Metadata = {
  title: "Sık Sorulan Sorular | Atölye Biz",
};

export default function SSSPage() {
  return <SSSContent />;
}
