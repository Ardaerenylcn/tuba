import { GiftCardForm } from "@/components/storefront/gift-card-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "E-Hediye Kartı | Tuba Atman Jewelry",
  description:
    "Sevdiklerinize Tuba Atman Jewelry atölyelerinde kullanabilecekleri bir e-hediye kartı armağan edin. Alıcının e-postasına gönderilir, 1 yıl boyunca istediği atölyede kullanılabilir.",
};

const STEPS = [
  { n: 1, title: "Tutarı seçin", desc: "Hediye kartının değerini belirleyin." },
  { n: 2, title: "Alıcıyı girin", desc: "Hediyeyi alacak kişinin bilgileri ve notunuz." },
  { n: 3, title: "Ödeme", desc: "Kart alıcının e-postasına anında gönderilir." },
];

export default function HediyeKartiPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-12 max-w-2xl">
        <p className="mb-3 text-xs font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">
          E-Hediye Kartı
        </p>
        <h1 className="mb-4 text-4xl font-light tracking-tight text-[var(--text-primary)] sm:text-5xl">
          Bir deneyim hediye edin
        </h1>
        <p className="text-base leading-relaxed text-[var(--text-secondary)]">
          Tuba Atman Jewelry e-hediye kartı, sevdiklerinize atölyelerimizde
          kullanabilecekleri özel bir deneyim armağan etmenin en zarif yolu. Kart, alıcının
          e-posta adresine anında gönderilir; alıcı <strong>1 yıl boyunca</strong> kendine
          uygun bir atölye ve tarih seçerek dilediği zaman kullanabilir.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">
        <GiftCardForm />

        {/* Nasıl çalışır */}
        <aside className="lg:order-last">
          <div className="border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="mb-5 text-xs font-medium tracking-[0.15em] uppercase text-[var(--text-muted)]">
              Nasıl çalışır?
            </p>
            <ol className="flex flex-col gap-5">
              {STEPS.map((s) => (
                <li key={s.n} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--text-primary)] text-[11px] font-medium text-[var(--surface)]">
                    {s.n}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{s.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <hr className="my-5 border-[var(--border)]" />
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              🎁 Alıcı, rezervasyon sırasında kart kodunu girerek bakiyeyi kullanır. Bakiye bitene
              kadar birden fazla atölyede geçerlidir.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
