"use client";

import { useState, useEffect } from "react";

interface ContactConfig {
  phone: string;
  whatsapp: string;
  instagram: string;
  location: string;
  weekdays: string;
  saturday: string;
  sunday: string;
}

const DEFAULTS: ContactConfig = {
  phone: "+90 532 517 51 71",
  whatsapp: "905325175171",
  instagram: "tubaatmanjewelry",
  location: "İstanbul, Türkiye",
  weekdays: "10:00 – 19:00",
  saturday: "10:00 – 17:00",
  sunday: "Kapalı",
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[var(--text-disabled)]">{hint}</p>}
    </div>
  );
}

export default function IletisimBilgileriPage() {
  const [form, setForm] = useState<ContactConfig>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/admin/site-content/contact_info")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.value) {
          setForm({ ...DEFAULTS, ...(d.data.value as Partial<ContactConfig>) });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof ContactConfig>(key: K, value: ContactConfig[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/v1/admin/site-content/contact_info", {
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
      <div className="p-6 max-w-2xl mx-auto flex flex-col gap-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-12 animate-pulse bg-[var(--bg-subtle)] border border-[var(--border)]" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="p-6 max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">İletişim Bilgileri</h1>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            İletişim sayfasında gösterilen bilgileri düzenleyin.
          </p>
        </div>
        <a
          href="/iletisim"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] underline underline-offset-2"
        >
          Önizleme →
        </a>
      </div>

      {/* İletişim kanalları */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-5">
        <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]">
          İletişim Kanalları
        </p>

        <Field label="Telefon numarası" hint="Görüntülenecek format — örn: +90 532 517 51 71">
          <input
            type="text"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            placeholder="+90 532 517 51 71"
          />
        </Field>

        <Field label="WhatsApp numarası (rakamlar)" hint="Uluslararası format, boşluksuz — örn: 905325175171">
          <input
            type="text"
            value={form.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            placeholder="905325175171"
          />
        </Field>

        <Field label="Instagram kullanıcı adı" hint="@ işareti olmadan — örn: tubaatmanjewelry">
          <input
            type="text"
            value={form.instagram}
            onChange={(e) => set("instagram", e.target.value)}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            placeholder="tubaatmanjewelry"
          />
        </Field>

        <Field label="Konum" hint="Kısa açıklama — örn: İstanbul, Türkiye">
          <input
            type="text"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            placeholder="İstanbul, Türkiye"
          />
        </Field>
      </div>

      {/* Çalışma saatleri */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-5">
        <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]">
          Çalışma Saatleri
        </p>

        <Field label="Pazartesi – Cuma saatleri" hint="Örn: 10:00 – 19:00">
          <input
            type="text"
            value={form.weekdays}
            onChange={(e) => set("weekdays", e.target.value)}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            placeholder="10:00 – 19:00"
          />
        </Field>

        <Field label="Cumartesi saatleri" hint="Örn: 10:00 – 17:00">
          <input
            type="text"
            value={form.saturday}
            onChange={(e) => set("saturday", e.target.value)}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            placeholder="10:00 – 17:00"
          />
        </Field>

        <Field label="Pazar saatleri" hint="Kapalıysa 'Kapalı' yazın">
          <input
            type="text"
            value={form.sunday}
            onChange={(e) => set("sunday", e.target.value)}
            className="h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]"
            placeholder="Kapalı"
          />
        </Field>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && (
        <p className="text-sm text-green-700">Değişiklikler kaydedildi. İletişim sayfasını yenileyin.</p>
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
