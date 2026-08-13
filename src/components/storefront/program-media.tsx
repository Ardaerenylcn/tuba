import Image from "next/image";
import { ImageSlider, type SliderImage } from "@/components/ui/image-slider";

interface Props {
  coverUrl: string | null | undefined;
  coverPosition: string | null;
  images: SliderImage[];
  title: string;
}

/**
 * Detay sayfasının görsel bloğu: üstte kapak, hemen altında galeri slider'ı.
 *
 * İkisi de aynı genişlikte (max-w-sm) olduğu için tek bir blok gibi durur;
 * kapak geniş, altındaki şerit dar kalınca düzen dağınık görünüyordu.
 *
 * Slider aynı anda 3 küçük kare gösterir. Şerit oranı görünen kare sayısıyla
 * ölçeklenmeli: yan yana üç 3:4 kare = 9:4. Oklar bu boyutta kalabalık
 * yaptığı için kapalı; gezinme noktalarla, dokunmatikte swipe ile.
 */
export function ProgramMedia({ coverUrl, coverPosition, images, title }: Props) {
  const hasCover = !!coverUrl;
  const hasImages = images.length > 0;
  if (!hasCover && !hasImages) return null;

  return (
    // Blok genişliği tek ayar noktası: büyütmek/küçültmek kapağı ve şeridi
    // birlikte ölçekler, hizaları bozulmaz.
    <div className="mb-2 max-w-sm">
      {hasCover && (
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--bg-muted)]">
          <Image
            src={coverUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 384px"
            className="object-cover"
            style={{ objectPosition: coverPosition ?? "center center" }}
            priority
          />
        </div>
      )}

      {hasImages && (
        <div className={hasCover ? "mt-2" : ""}>
          <ImageSlider
            images={images}
            perView={3}
            autoplay
            autoplayMs={4000}
            showArrows={false}
            aspectClassName="aspect-[9/4]"
            sizes="(max-width: 640px) 33vw, 130px"
          />
        </div>
      )}
    </div>
  );
}
