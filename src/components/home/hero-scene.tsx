"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroCanvas = dynamic(() => import("./hero-canvas"), {
  ssr: false,
  loading: () => null,
});

function CSSRingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="relative h-72 w-72 rounded-full opacity-60 lg:h-96 lg:w-96"
        style={{
          background:
            "conic-gradient(from 0deg, #c8a86a, #e8c890, #b8883a, #d4a855, #c8a86a)",
          padding: "38px",
          borderRadius: "9999px",
        }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{ background: "var(--color-stone-950)" }}
        />
      </div>
    </div>
  );
}

export function HeroScene() {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kasıtlı: mount/veri-yükleme kalıbı
    setReduced(mq.matches);

    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    setWebgl(!!gl);
  }, []);

  if (webgl === null) return null;
  if (!webgl || reduced) return <CSSRingFallback />;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <HeroCanvas />
    </div>
  );
}
