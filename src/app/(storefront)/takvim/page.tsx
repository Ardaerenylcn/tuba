import { db } from "@/lib/db";
import { CalendarView, type CalendarSession, type CalendarType } from "@/components/storefront/calendar-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Takvim | Atölye Biz",
  description: "Tüm atölye, workshop, deneme dersi ve sertifika programlarının tarihlerini görün, uygun tarihi seçip hemen kayıt olun.",
};

// Her istekte güncel veriyi göster
export const dynamic = "force-dynamic";

async function getCalendarData() {
  const now = new Date();

  const [sessions, categories] = await Promise.all([
    db.workshopSession.findMany({
      where: { status: "published", startAt: { gte: now } },
      orderBy: { startAt: "asc" },
      include: {
        program: { select: { title: true, slug: true, type: true, basePrice: true, currency: true } },
        instructor: { select: { name: true } },
        _count: {
          select: { reservations: { where: { status: { in: ["pending", "confirmed"] } } } },
        },
      },
    }),
    db.programCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { slug: true, name: true },
    }),
  ]);

  const serialized: CalendarSession[] = sessions.map((s) => ({
    id: s.id,
    title: s.program.title,
    programType: s.program.type,
    startAt: s.startAt.toISOString(),
    endAt: s.endAt.toISOString(),
    price: Number(s.priceOverride ?? s.program.basePrice),
    currency: s.program.currency,
    capacity: s.capacity,
    reserved: s._count.reservations,
    instructor: s.instructor?.name ?? null,
    locationName: s.locationName,
  }));

  // Takvimde geçen tipler için ad haritası (kategori adı, yoksa slug'tan türet)
  const catName = new Map(categories.map((c) => [c.slug, c.name]));
  const usedTypes = [...new Set(serialized.map((s) => s.programType))];
  const types: CalendarType[] = usedTypes.map((slug) => ({
    slug,
    name:
      catName.get(slug) ??
      slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " "),
  }));

  return { serialized, types };
}

export default async function TakvimPage() {
  const { serialized, types } = await getCalendarData();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 max-w-2xl sm:mb-10">
        <p className="mb-3 text-xs font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">
          Takvim
        </p>
        <h1 className="mb-4 text-4xl font-light tracking-tight text-[var(--text-primary)] sm:text-5xl">
          Tüm Programların Takvimi
        </h1>
        <p className="text-base leading-relaxed text-[var(--text-secondary)]">
          Atölyeler, workshoplar, deneme dersleri ve sertifika programlarının tüm tarihlerini
          burada görebilirsiniz. Size uygun tarihi seçip hemen kayıt olun.
        </p>
      </div>

      <CalendarView sessions={serialized} types={types} />
    </div>
  );
}
