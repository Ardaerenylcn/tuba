import { ImageResponse } from "next/og";

export const alt = "Tuba Atman Jewelry — Atölye Biz";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Marka temalı, kendi kendine yeten (harici font/görsel yok) OG görseli.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f3e7d3 0%, #e6d3b6 100%)",
          color: "#2c1810",
          position: "relative",
        }}
      >
        {/* Halka motifi filigranı */}
        <svg
          width="620"
          height="620"
          viewBox="0 0 620 620"
          fill="none"
          stroke="#2c1810"
          strokeWidth="1.4"
          style={{ position: "absolute", right: -120, top: -110, opacity: 0.12 }}
        >
          <circle cx="310" cy="310" r="290" />
          <circle cx="310" cy="310" r="230" />
          <circle cx="310" cy="310" r="170" />
          <circle cx="310" cy="310" r="110" />
          <circle cx="310" cy="310" r="55" />
        </svg>

        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 14,
            textTransform: "uppercase",
            opacity: 0.7,
            marginBottom: 28,
          }}
        >
          Atölye Biz
        </div>

        <div style={{ display: "flex", fontSize: 128, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}>
          tuba atman
        </div>

        <div style={{ display: "flex", fontSize: 40, letterSpacing: 22, textTransform: "uppercase", marginTop: 18, opacity: 0.85 }}>
          jewelry
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 30,
            marginTop: 44,
            opacity: 0.7,
            maxWidth: 760,
            textAlign: "center",
          }}
        >
          Çağdaş takı tasarımı ve el işçiliği atölyeleri
        </div>
      </div>
    ),
    size,
  );
}
