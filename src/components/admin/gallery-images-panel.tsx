"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface Props {
  programId: string;
  initialUrls: string[];
}

export function GalleryImagesPanel({ programId, initialUrls }: Props) {
  const [urls, setUrls] = useState<string[]>(initialUrls);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function showFlash(ok: boolean, text: string) {
    setFlash({ ok, text });
    setTimeout(() => setFlash(null), 3000);
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = "";
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/v1/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!data.success) throw new Error(data.message ?? "Yükleme başarısız.");
        uploaded.push(data.data.url as string);
      }
      setUrls((prev) => [...prev, ...uploaded]);
    } catch (err) {
      showFlash(false, err instanceof Error ? err.message : "Hata.");
    } finally {
      setUploading(false);
    }
  }

  function remove(url: string) {
    setUrls((prev) => prev.filter((u) => u !== url));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/programs/${programId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ galleryImageUrls: urls }),
      });
      const data = await res.json();
      showFlash(data.success, data.success ? "Kaydedildi." : (data.message ?? "Hata."));
    } catch {
      showFlash(false, "Sunucu hatası.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-[var(--text-primary)]">Fotoğraf Galerisi</h2>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">Program detay sayfasında gösterilir</p>
        </div>
        <div className="flex items-center gap-3">
          {flash && <span className={`text-xs ${flash.ok ? "text-green-700" : "text-red-600"}`}>{flash.text}</span>}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex h-8 items-center gap-1.5 border border-[var(--border)] px-3 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] disabled:opacity-40"
          >
            {uploading ? "Yükleniyor…" : "+ Görsel Ekle"}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex h-8 items-center bg-[var(--text-primary)] px-3 text-xs text-[var(--surface)] disabled:opacity-40"
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>

      {urls.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 border border-dashed border-[var(--border)] py-10 text-[var(--text-muted)] transition-colors hover:border-[var(--text-primary)]"
        >
          <span className="text-xs">Fotoğraf eklemek için tıklayın</span>
          <span className="text-[10px] text-[var(--text-disabled)]">Birden fazla seçebilirsiniz — maks. 10 MB</span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {urls.map((url, i) => (
            <div key={i} className="group relative aspect-[3/4] overflow-hidden border border-[var(--border)] bg-[var(--bg-muted)]">
              <Image src={url} alt={`Galeri ${i + 1}`} fill className="object-cover" sizes="160px" />
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                ×
              </button>
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

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleFiles} />
    </div>
  );
}
