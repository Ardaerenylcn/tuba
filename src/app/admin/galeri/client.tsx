"use client";

import { useRef, useState } from "react";
import type { GalleryImages } from "@/app/(storefront)/galeri/page";
import { GALLERY_DEFAULTS } from "@/lib/gallery-defaults";

interface Props {
  initial: GalleryImages;
}

const LAYERS: { key: keyof GalleryImages; label: string; description: string; count: number }[] = [
  { key: "layer1", label: "Dış Katman", description: "Sol ve sağ kenar sütunları — 6 görsel", count: 6 },
  { key: "layer2", label: "İç Katman", description: "Sol ve sağ iç sütunlar — 6 görsel", count: 6 },
  { key: "layer3", label: "Merkez Katman", description: "Ortadaki üst ve alt görseller — 2 görsel", count: 2 },
];

export function GaleriEditor({ initial }: Props) {
  const [config, setConfig] = useState<GalleryImages>(initial);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function showFlash(ok: boolean, text: string) {
    setFlash({ ok, text });
    setTimeout(() => setFlash(null), 3500);
  }

  async function upload(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/v1/admin/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (!json.success) throw new Error(json.message ?? "Yükleme başarısız.");
    return json.data.url as string;
  }

  async function handleFile(slotKey: string, layerKey: keyof GalleryImages, index: number | null, file: File) {
    setUploading(slotKey);
    try {
      const url = await upload(file);
      setConfig((prev) => {
        if (layerKey === "scaler") return { ...prev, scaler: url };
        const arr = [...(prev[layerKey] as string[])];
        arr[index!] = url;
        return { ...prev, [layerKey]: arr };
      });
    } catch (err) {
      showFlash(false, err instanceof Error ? err.message : "Yükleme hatası.");
    } finally {
      setUploading(null);
    }
  }

  async function handleReset() {
    if (!window.confirm("Tüm görseller varsayılan Unsplash görsellerine döndürülecek. Emin misiniz?")) return;
    setSaving(true);
    setConfig(GALLERY_DEFAULTS);
    try {
      const res = await fetch("/api/v1/admin/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(GALLERY_DEFAULTS),
      });
      const json = await res.json();
      showFlash(json.success, json.success ? "Varsayılana döndürüldü." : json.message);
    } catch {
      showFlash(false, "Sunucu hatası.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      showFlash(json.success, json.message ?? (json.success ? "Kaydedildi." : "Hata."));
    } catch {
      showFlash(false, "Sunucu hatası.");
    } finally {
      setSaving(false);
    }
  }

  function triggerInput(key: string) {
    fileInputRefs.current[key]?.click();
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-[var(--text-primary)]">Galeri Görselleri</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            Görseli değiştirmek için üzerine tıklayın, ardından kaydedin.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {flash && (
            <span className={`text-xs ${flash.ok ? "text-green-700" : "text-red-600"}`}>
              {flash.text}
            </span>
          )}
          <button
            onClick={handleReset}
            disabled={saving || uploading !== null}
            className="inline-flex h-9 items-center justify-center border border-[var(--border)] px-5 text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-secondary)] transition-colors hover:border-red-400 hover:text-red-600 disabled:opacity-40"
          >
            Varsayılana Dön
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading !== null}
            className="inline-flex h-9 items-center justify-center bg-[var(--text-primary)] px-5 text-xs font-medium tracking-[0.1em] uppercase text-[var(--surface)] transition-opacity disabled:opacity-40"
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>

      {/* Layer sections */}
      {LAYERS.map(({ key, label, description, count }) => (
        <div key={key} className="border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-5 py-3">
            <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
            <p className="text-xs text-[var(--text-muted)]">{description}</p>
          </div>
          <div className="grid grid-cols-3 gap-px bg-[var(--border)] sm:grid-cols-6">
            {Array.from({ length: count }).map((_, i) => {
              const slotKey = `${key}-${i}`;
              const url = (config[key] as string[])[i];
              const busy = uploading === slotKey;
              return (
                <div key={i} className="relative bg-[var(--surface)]">
                  <button
                    onClick={() => triggerInput(slotKey)}
                    disabled={busy || saving}
                    className="group relative block w-full overflow-hidden"
                    title="Değiştir"
                  >
                    <img
                      src={url}
                      alt={`${label} ${i + 1}`}
                      className="aspect-[4/5] w-full object-cover"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/0 transition-colors group-hover:bg-black/50 group-disabled:bg-black/20">
                      {busy ? (
                        <span className="text-xs text-white">Yükleniyor…</span>
                      ) : (
                        <span className="text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                          Değiştir
                        </span>
                      )}
                    </div>
                  </button>
                  <input
                    ref={(el) => { fileInputRefs.current[slotKey] = el; }}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(slotKey, key, i, file);
                      e.target.value = "";
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Scaler / center hero */}
      <div className="border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-5 py-3">
          <p className="text-sm font-medium text-[var(--text-primary)]">Ana Görsel</p>
          <p className="text-xs text-[var(--text-muted)]">Scroll animasyonunda tam ekrandan küçülen merkez görsel — 1 görsel</p>
        </div>
        <div className="p-5">
          <div className="relative w-40">
            <button
              onClick={() => triggerInput("scaler")}
              disabled={uploading === "scaler" || saving}
              className="group relative block w-full overflow-hidden"
              title="Değiştir"
            >
              <img
                src={config.scaler}
                alt="Ana görsel"
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/50 group-disabled:bg-black/20">
                {uploading === "scaler" ? (
                  <span className="text-xs text-white">Yükleniyor…</span>
                ) : (
                  <span className="text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                    Değiştir
                  </span>
                )}
              </div>
            </button>
            <input
              ref={(el) => { fileInputRefs.current["scaler"] = el; }}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile("scaler", "scaler", null, file);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
