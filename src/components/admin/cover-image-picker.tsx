"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageCropModal } from "@/components/admin/image-crop-modal";

interface Props {
  value: string | null;
  previewUrl: string | null;
  onChange: (id: string, url: string) => void;
  onClear: () => void;
  /** Kırpma oranı. Varsayılan 3:4 (dik kapak). Logo için 1 (kare). */
  aspect?: number;
  /** Çıktı formatı. Logo için "png" → şeffaflık korunur. Varsayılan "jpeg". */
  outputType?: "jpeg" | "png";
  /** Önizleme kutusunun görsel oturması. Logo için "contain". Varsayılan "cover". */
  objectFit?: "cover" | "contain";
  /** Üst etiket. Varsayılan "Kapak Görseli". */
  label?: string;
  /** Boş durum ipucu metni. */
  hint?: string;
}

export function CoverImagePicker({
  value: _value,
  previewUrl,
  onChange,
  onClear,
  aspect = 3 / 4,
  outputType = "jpeg",
  objectFit = "cover",
  label = "Kapak Görseli",
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cropSrc, setCropSrc] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleConfirm(blob: Blob) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      const ext = outputType === "png" ? "png" : "jpg";
      const mime = outputType === "png" ? "image/png" : "image/jpeg";
      fd.append("file", new File([blob], `cover.${ext}`, { type: mime }));
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
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">{label}</p>

      {cropSrc && (
        <ImageCropModal
          src={cropSrc}
          aspect={aspect}
          outputType={outputType}
          busy={uploading}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
        />
      )}

      {previewUrl ? (
        <div
          className="group relative w-full overflow-hidden border border-[var(--border)] bg-[var(--bg-subtle)]"
          style={{ aspectRatio: aspect }}
        >
          <Image
            src={previewUrl}
            alt={label}
            fill
            className={objectFit === "contain" ? "object-contain p-2" : "object-cover"}
            sizes="320px"
          />
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
          <span className="text-[10px] text-[var(--text-disabled)]">{hint ?? "Seçince kırpma ekranı açılır (3:4 — dik)"}</span>
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
