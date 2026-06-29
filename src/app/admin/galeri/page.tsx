import type { Metadata } from "next";
import { db } from "@/lib/db";
import { GALLERY_DEFAULTS } from "@/lib/gallery-defaults";
import { GaleriEditor } from "./client";
import type { GalleryImages } from "@/app/(storefront)/galeri/page";

export const metadata: Metadata = { title: "Galeri Görselleri | Admin" };

export default async function AdminGaleriPage() {
  const row = await db.siteContent.findUnique({
    where: { key_locale: { key: "gallery.images", locale: "tr" } },
  });

  const initial: GalleryImages =
    row?.value && typeof row.value === "object" && !Array.isArray(row.value)
      ? (row.value as unknown as GalleryImages)
      : GALLERY_DEFAULTS;

  return <GaleriEditor initial={initial} />;
}
