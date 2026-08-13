"use client";

import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { getCroppedBlob } from "@/lib/crop-image";

interface Props {
  /** Kırpılacak görselin data URL'i. */
  src: string;
  aspect: number;
  outputType?: "jpeg" | "png";
  /** Çıktı bu genişliği aşarsa küçültülür. */
  maxWidth?: number;
  busy?: boolean;
  /** Çoklu yüklemede "2 / 5" gibi ilerleme bilgisi. */
  progressLabel?: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void | Promise<void>;
}

/**
 * Tek görsel için kırpma katmanı. Kapak seçicisi ve galeri yüklemesi
 * aynı bileşeni kullanır, kırpma mantığı tek yerde durur.
 */
export function ImageCropModal({
  src,
  aspect,
  outputType = "jpeg",
  maxWidth,
  busy = false,
  progressLabel,
  onCancel,
  onConfirm,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, p: Area) => setPixels(p), []);

  async function confirm() {
    if (!pixels) return;
    const blob = await getCroppedBlob(src, pixels, outputType, maxWidth);
    await onConfirm(blob);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="relative flex-1">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>
      <div className="flex items-center justify-between gap-4 bg-black/90 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-white/50">Yakınlaştır</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-32 accent-white"
            aria-label="Yakınlaştırma"
          />
          {progressLabel && (
            <span className="ml-2 text-[11px] tabular-nums text-white/60">{progressLabel}</span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs text-white/60 transition-colors hover:text-white"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={busy || !pixels}
            className="bg-white px-5 py-2 text-xs font-medium text-black disabled:opacity-50"
          >
            {busy ? "Yükleniyor..." : "Onayla"}
          </button>
        </div>
      </div>
    </div>
  );
}
