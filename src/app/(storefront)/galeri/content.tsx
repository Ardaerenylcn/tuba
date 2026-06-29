"use client";

import { useEffect, useRef } from "react";
import { animate, scroll } from "framer-motion";
import type { GalleryImages } from "./page";
import styles from "./galeri.module.css";

const SCALE_EASINGS: [number, number, number, number][] = [
  [0.42, 0, 0.58, 1],
  [0.76, 0, 0.24, 1],
  [0.87, 0, 0.13, 1],
];

export function GaleriContent({ images }: { images: GalleryImages }) {
  const sectionRef = useRef<HTMLElement>(null);
  const scalerRef = useRef<HTMLImageElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const img = scalerRef.current;
    const section = sectionRef.current;
    if (!img || !section) return;

    const naturalW = img.offsetWidth;
    const naturalH = img.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const stops: VoidFunction[] = [];

    stops.push(
      scroll(
        animate(img, { width: [vw, naturalW] }, { ease: [0.65, 0, 0.35, 1] as [number, number, number, number] }),
        { target: section, offset: ["start start", "end end"] }
      )
    );
    stops.push(
      scroll(
        animate(img, { height: [vh, naturalH] }, { ease: [0.42, 0, 0.58, 1] as [number, number, number, number] }),
        { target: section, offset: ["start start", "end end"] }
      )
    );

    layerRefs.current.forEach((layer, i) => {
      if (!layer) return;
      const endOffset = `${1 - i * 0.05} end` as `${number} end`;

      stops.push(
        scroll(
          animate(layer, { opacity: [0, 0, 1] }, { times: [0, 0.55, 1], ease: [0.61, 1, 0.88, 1] as [number, number, number, number] }),
          { target: section, offset: ["start start", endOffset] }
        )
      );
      stops.push(
        scroll(
          animate(layer, { scale: [0, 0, 1] }, { times: [0, 0.3, 1], ease: SCALE_EASINGS[i] }),
          { target: section, offset: ["start start", endOffset] }
        )
      );
    });

    return () => stops.forEach((s) => s());
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          let&apos;s<br />scroll.
        </h1>
        <p className={styles.subtitle}>Atölye Biz · Takı Tasarımı Galerisi</p>
      </div>

      <section ref={sectionRef} className={styles.scrollSection}>
        <div className={styles.sticky}>
          <div className={styles.grid}>
            <div className={styles.layer} ref={(el) => { layerRefs.current[0] = el; }}>
              {images.layer1.map((src, i) => (
                <div key={i}><img src={src} alt="" loading="lazy" /></div>
              ))}
            </div>

            <div className={styles.layer} ref={(el) => { layerRefs.current[1] = el; }}>
              {images.layer2.map((src, i) => (
                <div key={i}><img src={src} alt="" loading="lazy" /></div>
              ))}
            </div>

            <div className={styles.layer} ref={(el) => { layerRefs.current[2] = el; }}>
              {images.layer3.map((src, i) => (
                <div key={i}><img src={src} alt="" loading="lazy" /></div>
              ))}
            </div>

            <div className={styles.scaler}>
              <img
                ref={scalerRef}
                src={images.scaler}
                alt="Atölye Biz galeri"
                className={styles.scalerImg}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.finSection}>
        <h2 className={styles.title}>fin.</h2>
      </section>
    </div>
  );
}
