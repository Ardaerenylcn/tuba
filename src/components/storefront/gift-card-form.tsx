"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PRESETS = [1000, 2500, 5000, 7500];
const MIN_AMOUNT = 500;

const inputCls =
  "h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]";
const labelCls = "text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]";

function formatCardNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

export function GiftCardForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  const [preset, setPreset] = useState<number | "custom">(2500);
  const [customAmount, setCustomAmount] = useState("");
  const [form, setForm] = useState({
    recipientName: "",
    recipientEmail: "",
    purchaserName: "",
    purchaserEmail: "",
    message: "",
  });
  const [card, setCard] = useState({ number: "", holder: "", expiry: "", cvv: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = preset === "custom" ? Math.floor(Number(customAmount) || 0) : preset;

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateStep1(): boolean {
    if (!amount || amount < MIN_AMOUNT) {
      setError(`Tutar en az ${MIN_AMOUNT.toLocaleString("tr-TR")} ₺ olmalıdır.`); return false;
    }
    if (form.recipientName.trim().length < 2) { setError("Alıcının adını girin."); return false; }
    if (!form.recipientEmail.includes("@")) { setError("Alıcının geçerli e-postasını girin."); return false; }
    if (form.purchaserName.trim().length < 2) { setError("Adınızı girin."); return false; }
    if (!form.purchaserEmail.includes("@")) { setError("Geçerli e-postanızı girin."); return false; }
    return true;
  }

  function validateStep2(): boolean {
    if (card.number.replace(/\s/g, "").length < 16) { setError("Kart numarası 16 haneli olmalıdır."); return false; }
    if (card.holder.trim().length < 2) { setError("Kart üzerindeki adı girin."); return false; }
    if (card.expiry.length < 5) { setError("Geçerli bir son kullanma tarihi girin."); return false; }
    if (card.cvv.length < 3) { setError("CVV 3 haneli olmalıdır."); return false; }
    return true;
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (validateStep1()) setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, ...form }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message ?? "Bir hata oluştu."); return; }
      const q = new URLSearchParams({
        code: data.data.code,
        value: String(data.data.value),
        rn: data.data.recipientName,
        re: data.data.recipientEmail,
        exp: data.data.expiresAt,
      });
      router.push(`/hediye-karti/basarili?${q.toString()}`);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Adımlar */}
      <div className="flex items-center gap-3">
        {[{ n: 1, label: "Hediye" }, { n: 2, label: "Ödeme" }].map(({ n, label }) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`flex h-6 w-6 items-center justify-center text-xs font-medium ${step >= n ? "bg-[var(--text-primary)] text-[var(--surface)]" : "border border-[var(--border)] text-[var(--text-muted)]"}`}>
              {n}
            </div>
            <span className={`text-xs ${step >= n ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>{label}</span>
            {n < 2 && <span className="text-[var(--text-disabled)]">—</span>}
          </div>
        ))}
      </div>

      {step === 1 ? (
        <form onSubmit={handleNext} noValidate className="flex flex-col gap-6">
          {/* Tutar */}
          <div className="flex flex-col gap-2">
            <label className={labelCls}>Hediye kartı tutarı <span className="text-[var(--accent)]">*</span></label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setPreset(p); setError(null); }}
                  className={`h-12 border text-sm transition-colors ${
                    preset === p
                      ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--surface)]"
                      : "border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--text-primary)]"
                  }`}
                >
                  {p.toLocaleString("tr-TR")} ₺
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreset("custom")}
                className={`h-11 shrink-0 border px-4 text-sm transition-colors ${
                  preset === "custom"
                    ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--surface)]"
                    : "border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--text-primary)]"
                }`}
              >
                Özel tutar
              </button>
              {preset === "custom" && (
                <div className="relative flex-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className={`${inputCls} w-full pr-8`}
                    placeholder={`En az ${MIN_AMOUNT.toLocaleString("tr-TR")}`}
                    autoFocus
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">₺</span>
                </div>
              )}
            </div>
          </div>

          {/* Alıcı */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className={labelCls}>Alıcının adı <span className="text-[var(--accent)]">*</span></label>
              <input type="text" value={form.recipientName} onChange={(e) => set("recipientName", e.target.value)} className={inputCls} placeholder="Hediye edeceğiniz kişi" />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelCls}>Alıcının e-postası <span className="text-[var(--accent)]">*</span></label>
              <input type="email" value={form.recipientEmail} onChange={(e) => set("recipientEmail", e.target.value)} className={inputCls} placeholder="alici@email.com" />
            </div>
          </div>

          {/* Not */}
          <div className="flex flex-col gap-2">
            <label className={labelCls}>Hediye notu (isteğe bağlı)</label>
            <textarea rows={3} value={form.message} onChange={(e) => set("message", e.target.value)} maxLength={500}
              className="resize-none border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
              placeholder="Alıcıya iletmek istediğiniz kısa bir mesaj..." />
          </div>

          {/* Satın alan */}
          <div className="grid grid-cols-1 gap-4 border-t border-[var(--border)] pt-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className={labelCls}>Adınız <span className="text-[var(--accent)]">*</span></label>
              <input type="text" value={form.purchaserName} onChange={(e) => set("purchaserName", e.target.value)} className={inputCls} placeholder="Adınız ve soyadınız" />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelCls}>E-postanız <span className="text-[var(--accent)]">*</span></label>
              <input type="email" value={form.purchaserEmail} onChange={(e) => set("purchaserEmail", e.target.value)} className={inputCls} placeholder="siz@email.com" />
            </div>
          </div>

          {error && (
            <div role="alert" className="border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-6">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-[var(--text-muted)]">Toplam</span>
              <span className="text-xl font-light text-[var(--text-primary)]">
                {(amount || 0).toLocaleString("tr-TR")} ₺
              </span>
            </div>
            <button type="submit" className="h-12 w-full bg-[var(--text-primary)] text-xs font-medium tracking-[0.15em] uppercase text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)]">
              Devam Et →
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <div className="flex items-center gap-2 border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600 shrink-0">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span className="text-xs text-[var(--text-muted)]">256-bit SSL ile güvenli ödeme</span>
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelCls}>Kart Numarası <span className="text-[var(--accent)]">*</span></label>
            <input type="text" inputMode="numeric" placeholder="0000 0000 0000 0000" value={card.number}
              onChange={(e) => setCard((p) => ({ ...p, number: formatCardNumber(e.target.value) }))}
              className={`${inputCls} font-mono tracking-widest`} />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelCls}>Kart Üzerindeki Ad <span className="text-[var(--accent)]">*</span></label>
            <input type="text" placeholder="AD SOYAD" value={card.holder}
              onChange={(e) => setCard((p) => ({ ...p, holder: e.target.value.toUpperCase() }))}
              className={`${inputCls} uppercase tracking-wider`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className={labelCls}>Son Kullanma <span className="text-[var(--accent)]">*</span></label>
              <input type="text" inputMode="numeric" placeholder="AA/YY" value={card.expiry}
                onChange={(e) => setCard((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                className={`${inputCls} font-mono tracking-widest`} />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelCls}>CVV <span className="text-[var(--accent)]">*</span></label>
              <input type="password" inputMode="numeric" placeholder="•••" maxLength={4} value={card.cvv}
                onChange={(e) => setCard((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                className={inputCls} />
            </div>
          </div>

          {error && (
            <div role="alert" className="border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-6">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-[var(--text-muted)]">Ödenecek Tutar</span>
              <span className="text-xl font-light text-[var(--text-primary)]">{amount.toLocaleString("tr-TR")} ₺</span>
            </div>
            <button type="submit" disabled={loading}
              className="h-12 w-full bg-[var(--text-primary)] text-xs font-medium tracking-[0.15em] uppercase text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)] disabled:opacity-50">
              {loading ? "İşleniyor..." : `${amount.toLocaleString("tr-TR")} ₺ Öde ve Gönder`}
            </button>
            <button type="button" onClick={() => { setStep(1); setError(null); }}
              className="text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)]">
              ← Geri dön
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
