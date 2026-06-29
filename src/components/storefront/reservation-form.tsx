"use client";

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

export function ReservationForm({
  sessionId,
  maxParticipants,
  pricePerPerson,
  currency,
}: ReservationFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  const totalPrice = form.participantCount * pricePerPerson;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors([]);

    if (!form.customerName.trim() || form.customerName.trim().length < 2) {
      setError("Ad soyad en az 2 karakter olmalıdır.");
      return;
    }
    if (!form.customerEmail.includes("@")) {
      setError("Geçerli bir e-posta adresi girin.");
      return;
    }
    if (form.customerPhone.replace(/\D/g, "").length < 7) {
      setError("Geçerli bir telefon numarası girin.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, ...form }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message ?? "Bir hata oluştu.");
        if (data.errors?.length) setFieldErrors(data.errors);
        return;
      }

      router.push(`/rezervasyon/basarili?id=${data.data.id}`);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {/* Name */}
      <div className="flex flex-col gap-2">
        <label htmlFor="customerName" className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
          Ad Soyad <span aria-hidden className="text-[var(--accent)]">*</span>
        </label>
        <input
          id="customerName"
          type="text"
          required
          autoComplete="name"
          value={form.customerName}
          onChange={(e) => set("customerName", e.target.value)}
          className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
          placeholder="Adınız ve soyadınız"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="customerEmail" className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
          E-posta <span aria-hidden className="text-[var(--accent)]">*</span>
        </label>
        <input
          id="customerEmail"
          type="email"
          required
          autoComplete="email"
          value={form.customerEmail}
          onChange={(e) => set("customerEmail", e.target.value)}
          className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
          placeholder="ornek@email.com"
        />
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-2">
        <label htmlFor="customerPhone" className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
          Telefon <span aria-hidden className="text-[var(--accent)]">*</span>
        </label>
        <input
          id="customerPhone"
          type="tel"
          required
          autoComplete="tel"
          value={form.customerPhone}
          onChange={(e) => set("customerPhone", e.target.value)}
          className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
          placeholder="+90 5XX XXX XX XX"
        />
      </div>

      {/* Participant count */}
      <div className="flex flex-col gap-2">
        <label htmlFor="participantCount" className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
          Katılımcı Sayısı
        </label>
        <select
          id="participantCount"
          value={form.participantCount}
          onChange={(e) => set("participantCount", Number(e.target.value))}
          className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)]"
        >
          {Array.from({ length: maxParticipants }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} kişi
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-2">
        <label htmlFor="notes" className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
          Not (isteğe bağlı)
        </label>
        <textarea
          id="notes"
          rows={3}
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          className="border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] placeholder:text-[var(--text-disabled)] resize-none"
          placeholder="Alerji, özel durum veya sormak istediğiniz bir şey..."
        />
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
          {fieldErrors.length > 0 && (
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-red-600">
              {fieldErrors.map((e) => <li key={e}>{e}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Total + Submit */}
      <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-6">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-[var(--text-muted)]">Toplam</span>
          <span className="text-xl font-light text-[var(--text-primary)]">
            {totalPrice.toLocaleString("tr-TR")} ₺
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full bg-[var(--text-primary)] text-xs font-medium tracking-[0.15em] uppercase text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Gönderiliyor..." : "Rezervasyon Yap"}
        </button>

        <p className="text-center text-xs text-[var(--text-muted)]">
          Devam ederek{" "}
          <a href="/yasal/iptal-iade" className="underline underline-offset-2">
            iptal ve iade koşullarını
          </a>{" "}
          kabul etmiş olursunuz.
        </p>
      </div>
    </form>
  );
}
