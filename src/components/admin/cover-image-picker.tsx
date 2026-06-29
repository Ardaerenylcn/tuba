"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const img = new window.Image();
  img.src = imageSrc;
  await new Promise((res) => { img.onload = res; });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  canvas.getContext("2d")!.drawImage(
    img,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height,
  );

  return new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.92));
}

interface Props {
  value: string | null;
  previewUrl: string | null;
  onChange: (id: string, url: string) => void;
  onClear: () => void;
}

export function CoverImagePicker({ value: _value, previewUrl, onChange, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleConfirm() {
    if (!cropSrc || !croppedAreaPixels) return;
    setUploading(true);
    setError(null);
    try {
      const blob = await getCroppedBlob(cropSrc, croppedAreaPixels);
      const fd = new FormData();
      fd.append("file", new File([blob], "cover.jpg", { type: "image/jpeg" }));
      const res = await fetch("/api/v1/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Yükleme başarısız.");
      onChange(data.data.id, data.data.url);
      setCropSrc(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükleme hatası.");
    } finally {
      setUploading(false);
    }
  }

  function handleCancel() {
    setCropSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">Kapak Görseli</p>

      {/* Kırpma modalı */}
      {cropSrc && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="relative flex-1">
            <Cropper
              image={cropSrc}
              crop={crop}
              zoom={zoom}
              aspect={3 / 4}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="flex items-center justify-between bg-black/90 px-6 py-4">
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
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-xs text-white/60 hover:text-white"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={uploading}
                className="bg-white px-5 py-2 text-xs font-medium text-black disabled:opacity-50"
              >
                {uploading ? "Yükleniyor..." : "Onayla"}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewUrl ? (
        <div className="group relative aspect-[3/4] w-full overflow-hidden border border-[var(--border)] bg-[var(--bg-subtle)]">
          <Image src={previewUrl} alt="Kapak görseli" fill className="object-cover" sizes="320px" />
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Görseli kaldır"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 border border-dashed border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-muted)] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span className="text-xs">Görsel seç</span>
          <span className="text-[10px] text-[var(--text-muted)]">JPEG, PNG, WebP — maks. 10 MB</span>
          <span className="text-[10px] text-[var(--text-disabled)]">Seçince kırpma ekranı açılır (3:4 — dik)</span>
        </button>
      )}

      {previewUrl && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)] disabled:opacity-50"
        >
          {uploading ? "Yükleniyor..." : "Görseli değiştir"}
        </button>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
