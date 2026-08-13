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
      <ImageSlider images={images} autoplay />
    </section>
  );
}
