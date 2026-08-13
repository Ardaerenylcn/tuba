import { db } from "@/lib/db";

export interface NavCategory {
  name: string;
  slug: string;
}

/**
 * Üst menüde gösterilecek kategoriler.
 *
 * Menü eskiden sabit kodluydu ("Workshoplar" → /atolyeler). Kategori slug'ı
 * değişince ya da yenisi eklenince menü ona uymuyordu; bu yüzden kategoriler
 * artık veritabanından okunuyor. Program adresleri /{kategori}/{program}
 * şeklinde olduğu için slug doğrudan yol olarak kullanılır.
 */
export async function getNavCategories(): Promise<NavCategory[]> {
  const cats = await db.programCategory.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { name: true, slug: true },
  });
  return cats;
}
