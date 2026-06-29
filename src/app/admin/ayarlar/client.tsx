"use client";

import { useState } from "react";

interface Settings {
  siteName: string;
  phone: string;
  email: string;
  address: string;
  instagramUrl: string;
  facebookUrl: string;
  whatsappNumber: string;
  mapEmbedUrl: string;
}

const DEFAULTS: Settings = {
  siteName: "Atölye Biz",
  phone: "+90 532 517 51 71",
  email: "",
  address: "İstanbul, Türkiye",
  instagramUrl: "",
  facebookUrl: "",
  whatsappNumber: "",
  mapEmbedUrl: "",
};

const FIELDS: { key: keyof Settings; label: string; placeholder: string; type?: string }[] = [
  { key: "siteName", label: "Site Adı", placeholder: "Atölye Biz" },
  { key: "phone", label: "Telefon", placeholder: "+90 532 517 51 71" },
  { key: "email", label: "E-posta", placeholder: "info@atolyebiz.com", type: "email" },
  { key: "address", label: "Adres", placeholder: "İstanbul, Türkiye" },
  { key: "whatsappNumber", label: "WhatsApp Numarası", placeholder: "905325175171" },
  { key: "instagramUrl", label: "Instagram URL", placeholder: "https://instagram.com/atolyebiz" },
  { key: "facebookUrl", label: "Facebook URL", placeholder: "https://facebook.com/atolyebiz" },
  { key: "mapEmbedUrl", label: "Google Maps Embed URL", placeholder: "https://maps.google.com/…" },
];

export function SettingsForm({ initial }: { initial: Partial<Settings> | null }) {
  const [form, setForm] = useState<Settings>({ ...DEFAULTS, ...(initial ?? {}) });
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);

  function set(key: keyof Settings, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setFlash(null);
    try {
      const res = await fetch("/api/v1/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      setFlash({ ok: json.success, text: json.message ?? (json.success ? "Kaydedildi." : "Hata.") });
    } catch {
      setFlash({ ok: false, text: "Sunucu hatası." });
    } finally {
      setSaving(false);
      setTimeout(() => setFlash(null), 3500);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-[var(--text-primary)]">Ayarlar</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">Site genelinde kullanılan bilgiler.</p>
        </div>
        <div className="flex items-center gap-3">
          {flash && (
            <span className={`text-xs ${flash.ok ? "text-green-700" : "text-red-600"}`}>
              {flash.text}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-9 items-center justify-center bg-[var(--text-primary)] px-5 text-xs font-medium tracking-[0.1em] uppercase text-[var(--surface)] transition-opacity disabled:opacity-40"
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>

      <div className="border border-[var(--border)] bg-[var(--surface)]">
        <div className="divide-y divide-[var(--border)]">
          {FIELDS.map(({ key, label, placeholder, type }) => (
            <div key={key} className="flex items-center gap-6 px-5 py-4">
              <label className="w-44 shrink-0 text-xs font-medium text-[var(--text-primary)]">
                {label}
              </label>
              <input
                type={type ?? "text"}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                className="flex-1 border-b border-[var(--border)] bg-transparent py-1 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus:border-[var(--text-primary)] focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
