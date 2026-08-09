"use client";

import { useState, useEffect } from "react";

type InfoIcon = "location" | "experience" | "groups" | "handmade";

interface InfoItem {
  icon: InfoIcon;
  title: string;
  sub: string;
  href: string;
}

interface HeroInfoBarConfig {
  items: InfoItem[];
}

const DEFAULTS: HeroInfoBarConfig = {
  items: [
    { icon: "location", title: "Fenerbahçe, Kadıköy", sub: "İstanbul", href: "/hakkimizda" },
    { icon: "experience", title: "15+ Yıllık Deneyim", sub: "Yakında gelecek", href: "/blog" },
    { icon: "groups", title: "Küçük Gruplar", sub: "Maks. 8 kişi", href: "/programlar" },
    { icon: "handmade", title: "El Yapımı Üretim", sub: "Her parça özgün", href: "/hakkimizda" },
  ],
};

const ICON_LABELS: Record<InfoIcon, string> = {
  location: "Konum (harita iğnesi)",
  experience: "Deneyim (kişi)",
  groups: "Gruplar (iki kişi)",
  handmade: "El Yapımı (kalkan + tik)",
};

/** Panelden sık seçilecek hedefler; istenirse elle de yazılabilir. */
const PATH_SUGGESTIONS = [
  "/",
  "/programlar",
  "/atolyeler",
  "/masterclass",
  "/sertifikalar",
  "/koleksiyonlar",
  "/hakkimizda",
  "/blog",
  "/iletisim",
  "/takvim",
  "/sss",
];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}

const inputCls =
  "h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]";

export default function HeroBilgiCubuguPage() {
  const [form, setForm] = useState<HeroInfoBarConfig>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/admin/site-content/hero_info_bar")
      .then((r) => r.json())
      .then((d) => {
        const value = d.success ? (d.data?.value as Partial<HeroInfoBarConfig> | undefined) : undefined;
        if (value?.items?.length) setForm({ items: value.items });
      })
      .finally(() => setLoading(false));
  }, []);

  function setItem(index: number, patch: Partial<InfoItem>) {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], ...patch };
      return { items };
    });
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/v1/admin/site-content/hero_info_bar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: form, status: "published" }),
    });
    const data = await res.json();
    if (!data.success) setError(data.message ?? "Kaydedilemedi.");
    else setSaved(true);
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto flex flex-col gap-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-32 animate-pulse bg-[var(--bg-subtle)] border border-[var(--border)]" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Hero Bilgi Çubuğu</h1>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Anasayfada büyük görselin hemen altındaki 4 kart. Her kart tıklanabilir —
            gittiği yolu buradan belirleyin.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] underline underline-offset-2"
        >
          Önizleme →
        </a>
      </div>

      {form.items.map((item, i) => (
        <div key={i} className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-4">
          <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]">
            Kart {i + 1}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="İkon">
              <select
                value={item.icon}
                onChange={(e) => setItem(i, { icon: e.target.value as InfoIcon })}
                className={inputCls}
              >
                {(Object.keys(ICON_LABELS) as InfoIcon[]).map((k) => (
                  <option key={k} value={k}>
                    {ICON_LABELS[k]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Başlık">
              <input
                type="text"
                value={item.title}
                onChange={(e) => setItem(i, { title: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Alt metin">
              <input
                type="text"
                value={item.sub}
                onChange={(e) => setItem(i, { sub: e.target.value })}
                className={inputCls}
                placeholder="(boş bırakılabilir)"
              />
            </Field>
          </div>

          <Field label="Yol (tıklanınca gidilecek adres)" hint="Site içi yol / ile başlar, ör. /programlar">
            <input
              type="text"
              required
              value={item.href}
              onChange={(e) => setItem(i, { href: e.target.value })}
              list={`yol-onerileri-${i}`}
              className={`${inputCls} font-mono`}
              placeholder="/programlar"
            />
            <datalist id={`yol-onerileri-${i}`}>
              {PATH_SUGGESTIONS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </Field>
        </div>
      ))}

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {saved && (
        <p className="text-sm text-green-700">Değişiklikler kaydedildi. Anasayfayı yenileyin.</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="h-10 px-8 bg-[var(--text-primary)] text-[11px] font-medium tracking-[0.12em] uppercase text-[var(--surface)] disabled:opacity-50"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <button
          type="button"
          onClick={() => { setForm(DEFAULTS); setSaved(false); }}
          className="h-10 px-5 border border-[var(--border)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          Varsayılana Sıfırla
        </button>
      </div>
    </form>
  );
}
