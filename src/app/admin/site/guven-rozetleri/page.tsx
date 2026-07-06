"use client";

import { useState, useEffect } from "react";

type BadgeIcon = "shipping" | "handmade" | "return" | "secure";

interface Badge {
  icon: BadgeIcon;
  title: string;
  sub: string;
}

interface TrustBadgesConfig {
  badges: Badge[];
}

const DEFAULTS: TrustBadgesConfig = {
  badges: [
    { icon: "shipping", title: "Ücretsiz Kargo", sub: "Tüm siparişlerde" },
    { icon: "handmade", title: "El Yapımı", sub: "Tüm ürünler el yapımıdır" },
    { icon: "return", title: "İade & Değişim", sub: "14 gün içinde kolay iade" },
    { icon: "secure", title: "Güvenli Ödeme", sub: "256-bit SSL koruması" },
  ],
};

const ICON_LABELS: Record<BadgeIcon, string> = {
  shipping: "Kargo (alışveriş çantası)",
  handmade: "El Yapımı (yıldız)",
  return: "İade (döngü okları)",
  secure: "Güvenli Ödeme (kilit)",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function GuvenRozetleriPage() {
  const [form, setForm] = useState<TrustBadgesConfig>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/admin/site-content/trust_badges")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.value) {
          setForm({ ...DEFAULTS, ...(d.data.value as Partial<TrustBadgesConfig>) });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function setBadge(index: number, patch: Partial<Badge>) {
    setForm((prev) => {
      const badges = [...prev.badges];
      badges[index] = { ...badges[index], ...patch };
      return { ...prev, badges };
    });
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/v1/admin/site-content/trust_badges", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: form, status: "published" }),
    });
    const data = await res.json();
    if (!data.success) {
      setError(data.message ?? "Kaydedilemedi.");
    } else {
      setSaved(true);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto flex flex-col gap-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-20 animate-pulse bg-[var(--bg-subtle)] border border-[var(--border)]" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Güven Rozetleri</h1>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Anasayfadaki 4 güven rozetini düzenleyin.
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

      {form.badges.map((badge, i) => (
        <div key={i} className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-4">
          <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]">
            Rozet {i + 1}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="İkon">
              <select
                value={badge.icon}
                onChange={(e) => setBadge(i, { icon: e.target.value as BadgeIcon })}
                className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
              >
                {(Object.keys(ICON_LABELS) as BadgeIcon[]).map((k) => (
                  <option key={k} value={k}>
                    {ICON_LABELS[k]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Başlık">
              <input
                type="text"
                value={badge.title}
                onChange={(e) => setBadge(i, { title: e.target.value })}
                className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
              />
            </Field>

            <Field label="Alt metin">
              <input
                type="text"
                value={badge.sub}
                onChange={(e) => setBadge(i, { sub: e.target.value })}
                className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
              />
            </Field>
          </div>
        </div>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}
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
