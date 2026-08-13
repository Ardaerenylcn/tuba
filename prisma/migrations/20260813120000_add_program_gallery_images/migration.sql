-- CreateTable
CREATE TABLE "program_gallery_images" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "mediaId" TEXT,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "program_gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "program_gallery_images_programId_sortOrder_idx" ON "program_gallery_images"("programId", "sortOrder");

-- AddForeignKey
ALTER TABLE "program_gallery_images" ADD CONSTRAINT "program_gallery_images_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_gallery_images" ADD CONSTRAINT "program_gallery_images_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Mevcut galeri görsellerini eski dizi kolonundan yeni tabloya taşı.
-- `programs.galleryImageIds` bilerek silinmiyor: kod geri alınırsa veri yerinde kalsın.
INSERT INTO "program_gallery_images" ("id", "programId", "mediaId", "url", "sortOrder", "isActive")
SELECT
  gen_random_uuid()::text,
  p."id",
  m."id",
  g."url",
  g."ord" - 1,
  true
FROM "programs" p
CROSS JOIN LATERAL unnest(p."galleryImageIds") WITH ORDINALITY AS g("url", "ord")
LEFT JOIN "media" m ON m."url" = g."url";
