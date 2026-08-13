import { ImageSlider, type SliderImage } from "@/components/ui/image-slider";

/**
 * Program detay sayfasındaki fotoğraf slider'ı — kapak görselinin altında,
 * ona göre küçük ve kendi kendine dönen ikincil bir alan.
 *
 * Oran 3:4: galeri görselleri panelde 3:4 kırpıldığı için burada yeniden
 * kırpılmaları gerekmiyor. Bu boyutta oklar kalabalık yaptığı için gizli;
 * gezinme noktalarla, dokunmatikte swipe ile yapılıyor. Tıklayınca büyür.
 */
export function ProgramGallery({ images }: { images: SliderImage[] }) {
  if (images.length === 0) return null;

  return (
    <section className="mt-5 max-w-sm">
      <p className="mb-2 text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--text-muted)]">
        Fotoğraflar
      </p>
      <ImageSlider
        images={images}
        autoplay
        autoplayMs={3500}
        showArrows={false}
        aspectClassName="aspect-[3/4]"
        className="max-w-[190px]"
        sizes="190px"
      />
    </section>
  );
}
