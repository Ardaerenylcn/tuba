"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageCropModal } from "@/components/admin/image-crop-modal";

/** Slider 3:4 gösterdiği için yüklenen görseller de 3:4 kırpılır. */
const GALLERY_ASPECT = 3 / 4;
/** Kırpılan çıktı bu genişliğe küçültülür — 3:4 slider en fazla ~450px geniş. */
const GALLERY_MAX_WIDTH = 1200;

export interface GalleryImageRow {
  id: string;
  url: string;
  sortOrder: number;
  isActive: boolean;
}

interface Props {
  programId: string;
  initialImages: GalleryImageRow[];
}

/**
 * Program galerisi yönetimi: yükle, sil, sürükleyerek sırala, aktif/pasif yap.
 *
 * Sıralama ve aktiflik değişiklikleri anında kaydedilir (program sıralama
 * listesindeki davranışın aynısı) — ayrı bir "Kaydet" adımı yok.
 */
export function GalleryImagesPanel({ programId, initialImages }: Props) {
  const [images, setImages] = useState<GalleryImageRow[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  /** Seçilen dosyalar sırayla kırpılır; kuyruğun başı ekranda gösterilir. */
  const [queue, setQueue] = useState<string[]>([]);
  const [queueTotal, setQueueTotal] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function showFlash(ok: boolean, text: string) {
    setFlash({ ok, text });
    setTimeout(() => setFlash(null), 3000);
  }

  async function persist(next: GalleryImageRow[]) {
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/admin/programs/${programId}/gallery`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: next.map((img, i) => ({ id: img.id, sortOrder: i, isActive: img.isActive })),
        }),
      });
      const data = await res.json();
      if (!data.success) showFlash(false, data.message ?? "Kaydedilemedi.");
      else showFlash(true, "Kaydedildi.");
    } catch {
      showFlash(false, "Sunucu hatası.");
    } finally {
      setBusy(false);
    }
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = "";
    // Dosyaları data URL'e çevirip kırpma kuyruğuna al.
    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Dosya okunamadı."));
            reader.readAsDataURL(file);
          }),
      ),
    )
      .then((srcs) => {
        setQueue(srcs);
        setQueueTotal(srcs.length);
      })
      .catch(() => showFlash(false, "Dosya okunamadı."));
  }

  /** Kırpılan görseli yükler, galeriye ekler ve kuyruktan bir sonrakine geçer. */
  async function handleCropConfirm(blob: Blob) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", new File([blob], "galeri.jpg", { type: "image/jpeg" }));
      const upload = await fetch("/api/v1/admin/upload", { method: "POST", body: fd });
      const uploaded = await upload.json();
      if (!uploaded.success) throw new Error(uploaded.message ?? "Yükleme başarısız.");

      const res = await fetch(`/api/v1/admin/programs/${programId}/gallery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: uploaded.data.url, mediaId: uploaded.data.id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Galeriye eklenemedi.");

      setImages((prev) => [...prev, data.data as GalleryImageRow]);
      setQueue((prev) => prev.slice(1));
      showFlash(true, "Görsel eklendi.");
    } catch (err) {
      showFlash(false, err instanceof Error ? err.message : "Hata.");
    } finally {
      setUploading(false);
    }
  }

  function cancelQueue() {
    setQueue([]);
    setQueueTotal(0);
  }

  async function remove(image: GalleryImageRow) {
    const previous = images;
    setImages((prev) => prev.filter((i) => i.id !== image.id));
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/admin/programs/${programId}/gallery/${image.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) {
        setImages(previous);
        showFlash(false, data.message ?? "Silinemedi.");
      } else {
        showFlash(true, "Görsel kaldırıldı.");
      }
    } catch {
      setImages(previous);
      showFlash(false, "Sunucu hatası.");
    } finally {
      setBusy(false);
    }
  }

  function toggleActive(image: GalleryImageRow) {
    const next = images.map((i) => (i.id === image.id ? { ...i, isActive: !i.isActive } : i));
    setImages(next);
    void persist(next);
  }

  function handleDrop(dropIndex: number) {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = [...images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(dropIndex, 0, moved);
    setImages(next);
    setDragIndex(null);
    setOverIndex(null);
    void persist(next);
  }

  const activeCount = images.filter((i) => i.isActive).length;

  return (
    <div className="border border-[var(--border)] bg-[var(--surface)] p-6">
      {queue.length > 0 && (
        <ImageCropModal
          src={queue[0]}
          aspect={GALLERY_ASPECT}
          maxWidth={GALLERY_MAX_WIDTH}
          busy={uploading}
          progressLabel={queueTotal > 1 ? `${queueTotal - queue.length + 1} / ${queueTotal}` : undefined}
          onCancel={cancelQueue}
          onConfirm={handleCropConfirm}
        />
      )}

      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-[var(--text-primary)]">Fotoğraf Slider&apos;ı</h2>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            3:4 kırpılır · {images.length} görsel, {activeCount} aktif ·
            sürükleyerek sıralayın
          </p>
        </div>
        <div className="flex items-center gap-3">
          {flash && (
            <span className={`text-xs ${flash.ok ? "text-green-700" : "text-red-600"}`}>
              {flash.text}
            </span>
          )}
          {!flash && busy && <span className="text-xs text-[var(--text-muted)]">Kaydediliyor…</span>}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 border border-[var(--border)] px-3 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] disabled:opacity-40"
          >
            {uploading ? "Yükleniyor…" : "+ Görsel Ekle"}
          </button>
        </div>
      </div>

      {images.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 border border-dashed border-[var(--border)] py-10 text-[var(--text-muted)] transition-colors hover:border-[var(--text-primary)]"
        >
          <span className="text-xs">Fotoğraf eklemek için tıklayın</span>
          <span className="text-[10px] text-[var(--text-disabled)]">
            Birden fazla seçebilirsiniz · her biri 3:4 kırpılır — maks. 10 MB
          </span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {images.map((img, i) => (
            <div
              key={img.id}
              draggable
              onDragStart={(e) => {
                setDragIndex(i);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (overIndex !== i) setOverIndex(i);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(i);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={`group relative aspect-[3/4] cursor-grab overflow-hidden border bg-[var(--bg-muted)] transition-all active:cursor-grabbing ${
                dragIndex === i ? "opacity-40" : ""
              } ${
                overIndex === i && dragIndex !== i
                  ? "border-[var(--text-primary)] ring-1 ring-inset ring-[var(--text-primary)]/30"
                  : "border-[var(--border)]"
              }`}
            >
              <Image
                src={img.url}
                alt={`Galeri ${i + 1}`}
                fill
                className={`object-cover transition-opacity ${img.isActive ? "" : "opacity-30"}`}
                sizes="160px"
              />

              <span className="absolute left-1 top-1 flex h-5 min-w-5 items-center justify-center bg-black/55 px-1 text-[10px] tabular-nums text-white">
                {i + 1}
              </span>

              {!img.isActive && (
                <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[10px] text-white">
                  Pasif
                </span>
              )}

              <div className="absolute right-1 top-1 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => toggleActive(img)}
                  title={img.isActive ? "Slider'da gizle" : "Slider'da göster"}
                  aria-label={img.isActive ? "Slider'da gizle" : "Slider'da göster"}
                  className="flex h-6 w-6 items-center justify-center bg-black/60 text-[11px] text-white transition-colors hover:bg-black/80"
                >
                  {img.isActive ? "🚫" : "✓"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(img)}
                  title="Sil"
                  aria-label="Görseli sil"
                  className="flex h-6 w-6 items-center justify-center bg-black/60 text-xs text-white transition-colors hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-[3/4] flex-col items-center justify-center border border-dashed border-[var(--border)] text-[var(--text-disabled)] transition-colors hover:border-[var(--text-muted)] disabled:opacity-40"
          >
            <span className="text-lg">+</span>
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  );
}
