"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ReservationFormProps {
  sessionId: string;
  maxParticipants: number;
  pricePerPerson: number;
  currency: string;
}

interface FormState {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  participantCount: number;
  notes: string;
}

const INITIAL_FORM: FormState = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  participantCount: 1,
  notes: "",
};

function formatCardNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

function cardBrand(num: string) {
  const n = num.replace(/\s/g, "");
  if (n.startsWith("4")) return "VISA";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "MC";
  return null;
}

export function ReservationForm({ sessionId, maxParticipants, pricePerPerson, currency }: ReservationFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [card, setCard] = useState({ number: "", holder: "", expiry: "", cvv: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [giftCode, setGiftCode] = useState("");
  const [giftApplied, setGiftApplied] = useState<{ balance: number } | null>(null);
  const [giftMsg, setGiftMsg] = useState<string | null>(null);
  const [giftLoading, setGiftLoading] = useState(false);

  const totalPrice = form.participantCount * pricePerPerson;
  const giftValue = giftApplied ? Math.min(giftApplied.balance, totalPrice) : 0;
  const netPrice = Math.max(0, totalPrice - giftValue);

  async function applyGift() {
    if (!giftCode.trim()) return;
    setGiftLoading(true);
    setGiftMsg(null);
    try {
      const res = await fetch("/api/v1/gift-cards/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: giftCode.trim(), orderAmount: totalPrice }),
      });
      const data = await res.json();
      if (!data.success) {
        setGiftApplied(null);
        setGiftMsg(data.message ?? "Geçersiz hediye kartı kodu.");
        return;
      }
      setGiftApplied({ balance: data.data.balance });
      setGiftMsg(null);
    } catch {
      setGiftMsg("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setGiftLoading(false);
    }
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateStep1() {
    if (!form.customerName.trim() || form.customerName.trim().length < 2) {
      setError("Ad soyad en az 2 karakter olmalıdır."); return false;
    }
    if (!form.customerEmail.includes("@")) {
      setError("Geçerli bir e-posta adresi girin."); return false;
    }
    if (form.customerPhone.replace(/\D/g, "").length < 7) {
      setError("Geçerli bir telefon numarası girin."); return false;
    }
    return true;
  }

  function validateStep2() {
    if (card.number.replace(/\s/g, "").length < 16) {
      setError("Kart numarası 16 haneli olmalıdır."); return false;
    }
    if (card.holder.trim().length < 2) {
      setError("Kart üzerindeki adı girin."); return false;
    }
    if (card.expiry.length < 5) {
      setError("Geçerli bir son kullanma tarihi girin."); return false;
    }
    if (card.cvv.length < 3) {
      setError("CVV 3 haneli olmalıdır."); return false;
    }
    return true;
  }

  async function createReservation() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, ...form, giftCardCode: giftApplied ? giftCode.trim() : undefined }),
      });
      const data = await res.json();
      if (!data.success) {
        // Oturum sona ermiş olabilir — üyelik zorunlu, girişe yönlendir.
        if (res.status === 401) {
          router.push(`/giris?redirect=${encodeURIComponent(`/rezervasyon?session=${sessionId}`)}`);
          return;
        }
        setError(data.message ?? "Bir hata oluştu."); return;
      }
      router.push(`/rezervasyon/basarili?id=${data.data.id}`);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validateStep1()) return;
    // Hediye kartı tümünü karşılıyorsa ödeme adımını atla
    if (netPrice === 0) { createReservation(); return; }
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validateStep2()) return;
    await createReservation();
  }

  const brand = cardBrand(card.number);

  return (
    <div className="flex flex-col gap-6">
      {/* Steps */}
      <div className="flex items-center gap-3">
        {[{ n: 1, label: "Bilgiler" }, { n: 2, label: "Ödeme" }].map(({ n, label }) => (
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
          {/* Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="customerName" className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
              Ad Soyad <span aria-hidden className="text-[var(--accent)]">*</span>
            </label>
            <input id="customerName" type="text" required autoComplete="name" value={form.customerName}
              onChange={(e) => set("customerName", e.target.value)}
              className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
              placeholder="Adınız ve soyadınız" />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="customerEmail" className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
              E-posta <span aria-hidden className="text-[var(--accent)]">*</span>
            </label>
            <input id="customerEmail" type="email" required autoComplete="email" value={form.customerEmail}
              onChange={(e) => set("customerEmail", e.target.value)}
              className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
              placeholder="ornek@email.com" />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-2">
            <label htmlFor="customerPhone" className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
              Telefon <span aria-hidden className="text-[var(--accent)]">*</span>
            </label>
            <input id="customerPhone" type="tel" required autoComplete="tel" value={form.customerPhone}
              onChange={(e) => set("customerPhone", e.target.value)}
              className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
              placeholder="+90 5XX XXX XX XX" />
          </div>

          {/* Participant count */}
          <div className="flex flex-col gap-2">
            <label htmlFor="participantCount" className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
              Katılımcı Sayısı
            </label>
            <select id="participantCount" value={form.participantCount}
              onChange={(e) => set("participantCount", Number(e.target.value))}
              className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)]">
              {Array.from({ length: maxParticipants }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} kişi</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <label htmlFor="notes" className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
              Not (isteğe bağlı)
            </label>
            <textarea id="notes" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)}
              className="border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)] resize-none"
              placeholder="Alerji, özel durum veya sormak istediğiniz bir şey..." />
          </div>

          {error && (
            <div role="alert" className="border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Hediye kartı */}
          <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-6">
            <label className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
              Hediye kartı kodu (isteğe bağlı)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={giftCode}
                onChange={(e) => { setGiftCode(e.target.value.toUpperCase()); setGiftApplied(null); setGiftMsg(null); }}
                placeholder="TUBA-XXXX-XXXX"
                className="h-11 flex-1 border border-[var(--border)] bg-[var(--surface)] px-4 font-mono text-sm tracking-wider text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
              />
              <button
                type="button"
                onClick={applyGift}
                disabled={giftLoading || !giftCode.trim()}
                className="h-11 shrink-0 border border-[var(--border-strong)] px-5 text-xs font-medium uppercase tracking-wider text-[var(--text-primary)] transition-colors hover:border-[var(--text-primary)] disabled:opacity-40"
              >
                {giftLoading ? "..." : "Uygula"}
              </button>
            </div>
            {giftMsg && <p className="text-xs text-red-600">{giftMsg}</p>}
            {giftApplied && (
              <p className="text-xs text-green-700">
                ✓ Hediye kartı uygulandı — bakiye: {giftApplied.balance.toLocaleString("tr-TR")} ₺
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-6">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-[var(--text-muted)]">Ara toplam</span>
              <span className="text-[var(--text-primary)]">{totalPrice.toLocaleString("tr-TR")} ₺</span>
            </div>
            {giftValue > 0 && (
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-[var(--text-muted)]">Hediye kartı</span>
                <span className="text-green-700">− {giftValue.toLocaleString("tr-TR")} ₺</span>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-[var(--border)] pt-3">
              <span className="text-sm text-[var(--text-muted)]">Ödenecek</span>
              <span className="text-xl font-light text-[var(--text-primary)]">
                {netPrice.toLocaleString("tr-TR")} ₺
              </span>
            </div>
            <button type="submit" disabled={loading}
              className="h-12 w-full bg-[var(--text-primary)] text-xs font-medium tracking-[0.15em] uppercase text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)] disabled:opacity-50">
              {netPrice === 0 ? (loading ? "İşleniyor..." : "Rezervasyonu Tamamla") : "Devam Et →"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          {/* Secure badge */}
          <div className="flex items-center gap-2 border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600 shrink-0">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span className="text-xs text-[var(--text-muted)]">256-bit SSL ile güvenli ödeme</span>
            {brand && <span className="ml-auto text-xs font-medium tracking-wider text-[var(--text-secondary)]">{brand}</span>}
          </div>

          {/* Card number */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
              Kart Numarası <span aria-hidden className="text-[var(--accent)]">*</span>
            </label>
            <input type="text" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000"
              value={card.number}
              onChange={(e) => setCard((p) => ({ ...p, number: formatCardNumber(e.target.value) }))}
              className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 font-mono text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)] tracking-widest" />
          </div>

          {/* Card holder */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
              Kart Üzerindeki Ad <span aria-hidden className="text-[var(--accent)]">*</span>
            </label>
            <input type="text" autoComplete="cc-name" placeholder="AD SOYAD"
              value={card.holder}
              onChange={(e) => setCard((p) => ({ ...p, holder: e.target.value.toUpperCase() }))}
              className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm uppercase text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)] tracking-wider" />
          </div>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
                Son Kullanma <span aria-hidden className="text-[var(--accent)]">*</span>
              </label>
              <input type="text" inputMode="numeric" autoComplete="cc-exp" placeholder="AA/YY"
                value={card.expiry}
                onChange={(e) => setCard((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 font-mono text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)] tracking-widest" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
                CVV <span aria-hidden className="text-[var(--accent)]">*</span>
              </label>
              <input type="password" inputMode="numeric" autoComplete="cc-csc" placeholder="•••"
                maxLength={4}
                value={card.cvv}
                onChange={(e) => setCard((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]" />
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
              <span className="text-xl font-light text-[var(--text-primary)]">
                {netPrice.toLocaleString("tr-TR")} ₺
              </span>
            </div>

            <button type="submit" disabled={loading}
              className="h-12 w-full bg-[var(--text-primary)] text-xs font-medium tracking-[0.15em] uppercase text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)] disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "İşleniyor..." : `${netPrice.toLocaleString("tr-TR")} ₺ Öde`}
            </button>

            <button type="button" onClick={() => { setStep(1); setError(null); }}
              className="text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)]">
              ← Geri dön
            </button>

            <p className="text-center text-xs text-[var(--text-muted)]">
              Devam ederek{" "}
              <Link href="/yasal/iptal-iade" className="underline underline-offset-2">iptal ve iade koşullarını</Link>{" "}
              kabul etmiş olursunuz.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
