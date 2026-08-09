import Image from "next/image";

/**
 * Detay sayfasının üst görseli.
 *
 * Kapak görseli admin panelinde 3:4 kırpılıp saklanıyor; liste kartlarıyla aynı
 * oranda gösterilir ki hiçbir yer kırpılmasın. Dikey oran tam içerik genişliğinde
 * ekranı doldurduğu için genişlik `max-w-sm` ile sınırlanır.
 */
export function ProgramCoverImage({
  url,
  position,
  alt,
}: {
  url: string | null | undefined;
  position: string | null;
  alt: string;
}) {
  if (!url) return null;

  return (
    <div className="aspect-[3/4] w-full max-w-sm overflow-hidden border border-[var(--border)] bg-[var(--bg-muted)]">
      <Image
        src={url}
        alt={alt}
        width={768}
        height={1024}
        className="h-full w-full object-cover"
        style={{ objectPosition: position ?? "center center" }}
        priority
      />
    </div>
  );
}
