import { db } from "@/lib/db";
import { MediaGrid } from "./client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Medya | Admin" };

export default async function AdminMediaPage() {
  const media = await db.media.findMany({
    orderBy: { createdAt: "desc" },
  });

  const totalSize = media.reduce((sum, m) => sum + (m.sizeBytes ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium text-[var(--text-primary)]">Medya Kütüphanesi</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {media.length} dosya
            {totalSize > 0 && ` · ${(totalSize / 1024 / 1024).toFixed(1)} MB toplam`}
          </p>
        </div>
      </div>

      <MediaGrid items={media} />
    </div>
  );
}
