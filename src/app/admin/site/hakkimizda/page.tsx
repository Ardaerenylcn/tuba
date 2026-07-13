"use client";

import { useState, useEffect } from "react";
import { CoverImagePicker } from "@/components/admin/cover-image-picker";

interface Stat { deger: string; etiket: string; }
interface Value { baslik: string; aciklama: string; }

interface HakkimizdaConfig {
  heroImageUrl: string; heroImageId: string | null;
  heroEyebrow: string; heroTitle: string; heroSubtitle: string;
  quote: string; quoteAuthor: string;
  storyImageUrl: string; storyImageId: string | null;
  storyYearLabel: string; storyHeading: string;
  storyParagraph1: string; storyParagraph2: string;
  stats: Stat[];
  values: Value[];
  bannerImageUrl: string; bannerImageId: string | null; bannerQuote: string;
  ctaHeading: string; ctaBtn1Text: string; ctaBtn1Href: string; ctaBtn2Text: string; ctaBtn2Href: string;
}

const DEFAULTS: HakkimizdaConfig = {
  heroImageUrl: "/pic_01.jpeg", heroImageId: null,
  heroEyebrow: "Hikayemiz", heroTitle: "Hakkımızda",
  heroSubtitle: "İstanbul'un kalbinde, el işçiliğinin yaşatıldığı bir atölye.",
  quote: "Takı; metal ile emeğin buluştuğu andır. Biz o anı öğretiyoruz.",
  quoteAuthor: "Tuba Atman",
  storyImageUrl: "/pic_02.jpeg", storyImageId: null,
  storyYearLabel: "Başlangıç · 2016",
  storyHeading: "Her takıda bir emeğin, bir anın izi var.",
  storyParagraph1: "2016 yılında küçük bir takı merakıyla başlayan bu yolculuk, bugün yüzlerce öğrencinin kendi tasarım sesini bulduğu bir atölyeye dönüştü.",
  storyParagraph2: "Atölyemizde maksimum 6 kişilik gruplarla çalışıyoruz.",
  stats: [
    { deger: "2016", etiket: "Kuruluş Yılı" },
    { deger: "1.200+", etiket: "Mezun Öğrenci" },
    { deger: "≤6", etiket: "Kişilik Gruplar" },
    { deger: "100+", etiket: "Tamamlanan Program" },
  ],
  values: [
    { baslik: "Küçük Gruplar", aciklama: "Maksimum 6 kişilik gruplar." },
    { baslik: "Kaliteli Malzeme", aciklama: "Gerçek gümüş, altın ve değerli taşlar." },
    { baslik: "Deneyimli Eğitmenler", aciklama: "Yıllarca sektörde çalışmış ustalar." },
    { baslik: "Her Seviyeye Uygun", aciklama: "Başlangıçtan ileri düzeye programlar." },
    { baslik: "Sertifikalı Eğitim", aciklama: "Resmi sertifika belgesi düzenliyoruz." },
    { baslik: "Güvenli Atölye", aciklama: "Profesyonel ekipman ve eğitmen gözetimi." },
  ],
  bannerImageUrl: "/hero-banner.webp", bannerImageId: null,
  bannerQuote: "Kendi takını yaratmanın zamanı geldi.",
  ctaHeading: "Kendi takınızı tasarlayın.",
  ctaBtn1Text: "Atölyeleri İncele", ctaBtn1Href: "/atolyeler",
  ctaBtn2Text: "İletişime Geç", ctaBtn2Href: "/iletisim",
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-[var(--text-muted)]">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-[var(--text-disabled)]">{hint}</p>}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-[var(--border)] pb-3 mb-5">
      <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--text-muted)]">{title}</p>
    </div>
  );
}

const inputCls = "h-10 border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]";
const textareaCls = "border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] resize-none";

export default function HakkimizdaAdminPage() {
  const [form, setForm] = useState<HakkimizdaConfig>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/admin/site-content/hakkimizda")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.value) {
          const v = d.data.value as Partial<HakkimizdaConfig>;
          setForm({
            ...DEFAULTS, ...v,
            stats: v.stats ?? DEFAULTS.stats,
            values: v.values ?? DEFAULTS.values,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof HakkimizdaConfig>(key: K, value: HakkimizdaConfig[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  function setStat(i: number, field: keyof Stat, val: string) {
    setForm((p) => {
      const stats = [...p.stats];
      stats[i] = { ...stats[i], [field]: val };
      return { ...p, stats };
    });
    setSaved(false);
  }

  function addStat() {
    setForm((p) => ({ ...p, stats: [...p.stats, { deger: "", etiket: "" }] }));
  }
  function removeStat(i: number) {
    setForm((p) => ({ ...p, stats: p.stats.filter((_, idx) => idx !== i) }));
  }

  function setValue(i: number, field: keyof Value, val: string) {
    setForm((p) => {
      const values = [...p.values];
      values[i] = { ...values[i], [field]: val };
      return { ...p, values };
    });
    setSaved(false);
  }

  function addValue() {
    setForm((p) => ({ ...p, values: [...p.values, { baslik: "", aciklama: "" }] }));
  }
  function removeValue(i: number) {
    setForm((p) => ({ ...p, values: p.values.filter((_, idx) => idx !== i) }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null); setSaved(false);
    const res = await fetch("/api/v1/admin/site-content/hakkimizda", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: form, status: "published" }),
    });
    const data = await res.json();
    if (!data.success) { setError(data.message ?? "Kaydedilemedi."); }
    else { setSaved(true); }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto flex flex-col gap-4">
        {[1,2,3,4].map((n) => <div key={n} className="h-12 animate-pulse bg-[var(--bg-subtle)] border border-[var(--border)]" />)}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Hakkımızda Sayfası</h1>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">Tüm bölümleri buradan düzenleyin.</p>
        </div>
        <a href="/hakkimizda" target="_blank" rel="noopener noreferrer"
          className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] underline underline-offset-2">
          Önizleme →
        </a>
      </div>

      {/* Hero */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-5">
        <SectionHeader title="Hero Banner" />
        <CoverImagePicker
          value={form.heroImageId}
          previewUrl={form.heroImageUrl}
          onChange={(id, url) => setForm((p) => ({ ...p, heroImageId: id, heroImageUrl: url }))}
          onClear={() => setForm((p) => ({ ...p, heroImageId: null, heroImageUrl: DEFAULTS.heroImageUrl }))}
          aspect={16 / 9}
        />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Üst metin">
            <input className={inputCls} value={form.heroEyebrow} onChange={(e) => set("heroEyebrow", e.target.value)} placeholder="Hikayemiz" />
          </Field>
          <Field label="Başlık *">
            <input className={inputCls} value={form.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} placeholder="Hakkımızda" />
          </Field>
        </div>
        <Field label="Alt metin">
          <input className={inputCls} value={form.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} placeholder="İstanbul'un kalbinde..." />
        </Field>
      </div>

      {/* Alıntı */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-5">
        <SectionHeader title="Alıntı" />
        <Field label="Alıntı metni">
          <textarea className={textareaCls} rows={3} value={form.quote} onChange={(e) => set("quote", e.target.value)} />
        </Field>
        <Field label="İmza / Yazar">
          <input className={inputCls} value={form.quoteAuthor} onChange={(e) => set("quoteAuthor", e.target.value)} placeholder="Tuba Atman" />
        </Field>
      </div>

      {/* Hikaye */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-5">
        <SectionHeader title="Hikaye Bölümü" />
        <CoverImagePicker
          value={form.storyImageId}
          previewUrl={form.storyImageUrl}
          onChange={(id, url) => setForm((p) => ({ ...p, storyImageId: id, storyImageUrl: url }))}
          onClear={() => setForm((p) => ({ ...p, storyImageId: null, storyImageUrl: DEFAULTS.storyImageUrl }))}
          aspect={4 / 3}
        />
        <Field label="Yıl / etiket">
          <input className={inputCls} value={form.storyYearLabel} onChange={(e) => set("storyYearLabel", e.target.value)} placeholder="Başlangıç · 2016" />
        </Field>
        <Field label="Başlık">
          <input className={inputCls} value={form.storyHeading} onChange={(e) => set("storyHeading", e.target.value)} />
        </Field>
        <Field label="1. Paragraf">
          <textarea className={textareaCls} rows={3} value={form.storyParagraph1} onChange={(e) => set("storyParagraph1", e.target.value)} />
        </Field>
        <Field label="2. Paragraf">
          <textarea className={textareaCls} rows={3} value={form.storyParagraph2} onChange={(e) => set("storyParagraph2", e.target.value)} />
        </Field>
      </div>

      {/* İstatistikler */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-4">
        <SectionHeader title="İstatistikler" />
        {form.stats.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <Field label={i === 0 ? "Değer" : ""}>
              <input className={inputCls} value={s.deger} onChange={(e) => setStat(i, "deger", e.target.value)} placeholder="2016" />
            </Field>
            <Field label={i === 0 ? "Etiket" : ""}>
              <input className={inputCls} value={s.etiket} onChange={(e) => setStat(i, "etiket", e.target.value)} placeholder="Kuruluş Yılı" />
            </Field>
            <button type="button" onClick={() => removeStat(i)}
              className="h-10 px-3 border border-red-200 text-[11px] text-red-500 hover:border-red-400">
              Sil
            </button>
          </div>
        ))}
        <button type="button" onClick={addStat}
          className="h-9 border border-dashed border-[var(--border)] text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]">
          + İstatistik Ekle
        </button>
      </div>

      {/* Değerlerimiz */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-4">
        <SectionHeader title="Değerlerimiz" />
        {form.values.map((v, i) => (
          <div key={i} className="border border-[var(--border)] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-muted)]">{String(i + 1).padStart(2, "0")}</span>
              <button type="button" onClick={() => removeValue(i)}
                className="text-[11px] text-red-500 hover:underline">Sil</button>
            </div>
            <Field label="Başlık">
              <input className={inputCls} value={v.baslik} onChange={(e) => setValue(i, "baslik", e.target.value)} placeholder="Küçük Gruplar" />
            </Field>
            <Field label="Açıklama">
              <textarea className={textareaCls} rows={2} value={v.aciklama} onChange={(e) => setValue(i, "aciklama", e.target.value)} />
            </Field>
          </div>
        ))}
        <button type="button" onClick={addValue}
          className="h-9 border border-dashed border-[var(--border)] text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]">
          + Değer Ekle
        </button>
      </div>

      {/* Banner */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-5">
        <SectionHeader title="Görsel Bant" />
        <CoverImagePicker
          value={form.bannerImageId}
          previewUrl={form.bannerImageUrl}
          onChange={(id, url) => setForm((p) => ({ ...p, bannerImageId: id, bannerImageUrl: url }))}
          onClear={() => setForm((p) => ({ ...p, bannerImageId: null, bannerImageUrl: DEFAULTS.bannerImageUrl }))}
          aspect={16 / 9}
        />
        <Field label="Bant alıntısı">
          <input className={inputCls} value={form.bannerQuote} onChange={(e) => set("bannerQuote", e.target.value)} placeholder="Kendi takını yaratmanın zamanı geldi." />
        </Field>
      </div>

      {/* CTA */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-5">
        <SectionHeader title="Harekete Geçirici (CTA)" />
        <Field label="Başlık">
          <input className={inputCls} value={form.ctaHeading} onChange={(e) => set("ctaHeading", e.target.value)} placeholder="Kendi takınızı tasarlayın." />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="1. Buton metni">
            <input className={inputCls} value={form.ctaBtn1Text} onChange={(e) => set("ctaBtn1Text", e.target.value)} placeholder="Atölyeleri İncele" />
          </Field>
          <Field label="1. Buton linki">
            <input className={`${inputCls} font-mono`} value={form.ctaBtn1Href} onChange={(e) => set("ctaBtn1Href", e.target.value)} placeholder="/atolyeler" />
          </Field>
          <Field label="2. Buton metni">
            <input className={inputCls} value={form.ctaBtn2Text} onChange={(e) => set("ctaBtn2Text", e.target.value)} placeholder="İletişime Geç" />
          </Field>
          <Field label="2. Buton linki">
            <input className={`${inputCls} font-mono`} value={form.ctaBtn2Href} onChange={(e) => set("ctaBtn2Href", e.target.value)} placeholder="/iletisim" />
          </Field>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-700">Kaydedildi. Sayfayı yenileyin.</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="h-10 px-8 bg-[var(--text-primary)] text-[11px] font-medium tracking-[0.12em] uppercase text-[var(--surface)] disabled:opacity-50">
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <button type="button" onClick={() => { setForm(DEFAULTS); setSaved(false); }}
          className="h-10 px-5 border border-[var(--border)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          Varsayılana Sıfırla
        </button>
      </div>
    </form>
  );
}
