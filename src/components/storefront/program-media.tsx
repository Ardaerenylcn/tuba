import Image from "next/image";
import { ImageSlider, type SliderImage } from "@/components/ui/image-slider";

interface Props {
  coverUrl: string | null | undefined;
  coverPosition: string | null;
  images: SliderImage[];
  title: string;
}

/**
 * Detay sayfasının görsel bloğu: solda kapak, sağında galeri slider'ı.
 *
 * Üç eşit sütunlu bir satır — kapak 1, slider 2 sütun kaplar ve aynı anda
 * 2 fotoğraf gösterir. Böylece üç kare de aynı genişlikte ve aynı 3:4
 * oranında olur, satır içerik kolonunu tam doldurur. Önceki düzende kapak
 * dar kalıyor, yanında ve küçük slider'ın çevresinde boşluk oluşuyordu.
 *
 * Slider'ın şeridi 3:2'dir: yan yana iki 3:4 kare = 6:4 = 3:2.
 */
export function ProgramMedia({ coverUrl, coverPosition, images, title }: Props) {
  const hasCover = !!coverUrl;
  const hasImages = images.length > 0;
  if (!hasCover && !hasImages) return null;

  // Kapak yoksa slider tüm satırı kaplar, boşluk bırakmaz.
  const sliderSpan = hasCover ? "sm:col-span-2" : "sm:col-span-3";

  return (
    <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
      {hasCover && (
        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--bg-muted)]">
          <Image
            src={coverUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 240px"
            className="object-cover"
            style={{ objectPosition: coverPosition ?? "center center" }}
            priority
          />
        </div>
      )}

      {hasImages && (
        <div className={sliderSpan}>
          <ImageSlider
            images={images}
            perView={2}
            autoplay
            autoplayMs={4000}
            aspectClassName="aspect-[3/2]"
            sizes="(max-width: 640px) 50vw, 240px"
          />
        </div>
      )}
    </div>
  );
}
