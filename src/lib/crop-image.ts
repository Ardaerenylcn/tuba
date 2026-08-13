import type { Area } from "react-easy-crop";

/**
 * Seçilen kırpma alanını canvas üzerinde kesip yükleme için Blob döndürür.
 *
 * `maxWidth` verilirse çıktı o genişliğe küçültülür — galeri gibi çok görselli
 * alanlarda depolama ve çıkış trafiğini gereksiz büyütmemek için.
 */
export async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area,
  outputType: "jpeg" | "png",
  maxWidth?: number,
): Promise<Blob> {
  const img = new window.Image();
  img.src = imageSrc;
  await new Promise((res) => { img.onload = res; });

  const scale = maxWidth && pixelCrop.width > maxWidth ? maxWidth / pixelCrop.width : 1;
  const outW = Math.round(pixelCrop.width * scale);
  const outH = Math.round(pixelCrop.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  canvas.getContext("2d")!.drawImage(
    img,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, outW, outH,
  );

  const mime = outputType === "png" ? "image/png" : "image/jpeg";
  return new Promise((res) => canvas.toBlob((b) => res(b!), mime, 0.92));
}
