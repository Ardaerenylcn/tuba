import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tuba Atman Jewelry — Atölye Biz",
    short_name: "Atölye Biz",
    description:
      "Çağdaş takı tasarımı, el işçiliği ve İstanbul'daki yaratıcı atölye deneyimleri.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf4eb",
    theme_color: "#2c1810",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
