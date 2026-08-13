import { ImageSlider, type SliderImage } from "@/components/ui/image-slider";

/**
 * Program detay sayfasındaki fotoğraf bölümü.
 *
 * Görseller `ProgramGalleryImage` tablosundan gelir; sıra ve aktif/pasif
 * durumu admin panelinden yönetilir. Sunucu bileşeni olarak kalır, etkileşim
 * ImageSlider'ın içindedir.
 */
export function ProgramGallery({ images }: { images: SliderImage[] }) {
  if (images.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="mb-5 text-xl font-light text-[var(--text-primary)]">Fotoğraflar</h2>
      {/* Yüklenen fotoğrafların çoğu telefonla çekilmiş dikey kare olduğu için
          slider da dikey: 16:9 çerçeve bu fotoğrafların ~2/3'ünü kırpıyordu.
          Kapak görseliyle aynı oran, sayfa bütün duruyor. Genişlik sınırlı,
          aksi hâlde dikey oran masaüstünde ekranı doldurur. */}
      <ImageSlider
        images={images}
        autoplay
        aspectClassName="aspect-[3/4]"
        className="max-w-sm"
      />
    </section>
  );
}
