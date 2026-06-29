import type { Metadata } from "next";
import { db } from "@/lib/db";
import { GALLERY_DEFAULTS } from "@/lib/gallery-defaults";
import { GaleriContent } from "./content";

export const metadata: Metadata = { title: "Galeri | Atölye Biz" };

export interface GalleryImages {
  layer1: string[];
  layer2: string[];
  layer3: string[];
  scaler: string;
}

export default async function GaleriPage() {
  const row = await db.siteContent.findUnique({
    where: { key_locale: { key: "gallery.images", locale: "tr" } },
  });

  const images: GalleryImages =
    row?.value && typeof row.value === "object" && !Array.isArray(row.value)
      ? (row.value as unknown as GalleryImages)
      : GALLERY_DEFAULTS;

  return <GaleriContent images={images} />;
}
