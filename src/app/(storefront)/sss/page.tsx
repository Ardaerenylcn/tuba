import type { Metadata } from "next";
import { getSssConfig } from "@/lib/site-content";
import { SSSContent } from "./content";

export const metadata: Metadata = {
  title: "Sık Sorulan Sorular | Atölye Biz",
};

export default async function SSSPage() {
  const { items } = await getSssConfig();
  return <SSSContent items={items} />;
}
