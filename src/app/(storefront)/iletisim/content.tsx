"use client";

import { PageHero } from "@/components/storefront/page-hero";
import { FadeUp } from "@/components/ui/animate";
import { ContactForm } from "@/components/storefront/contact-form";

export function IletisimContent({ mapEmbedUrl }: { mapEmbedUrl: string | null }) {
  return (
    <>
      <PageHero
        eyebrow="İletişim"
        title="Bize Ulaşın"
        description="Sorularınız, rezervasyon talepleriniz veya özel etkinlik planlamanız için buradayız."
      />

      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_340px]">
          {/* Form */}
          <FadeUp>
            <p className="mb-8 text-[var(--text-secondary)]">
              Aşağıdaki formu doldurun; en kısa sürede geri döneceğiz.
            </p>
            <ContactForm />
          </FadeUp>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            {[
              {
                label: "Telefon",
                content: (
                  <a href="tel:+905325175171" className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                    +90 532 517 51 71
                  </a>
                ),
                sub: "Hafta içi 10:00 – 19:00",
              },
              {
                label: "WhatsApp",
                content: (
                  <a href="https://wa.me/905325175171" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                    WhatsApp ile yaz →
                  </a>
                ),
              },
              {
                label: "Konum",
                content: <p className="text-sm text-[var(--text-secondary)]">İstanbul, Türkiye</p>,
                sub: "Kesin adres rezervasyon onayı sonrası iletilir.",
              },
              {
                label: "Sosyal Medya",
                content: (
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    Instagram →
                  </a>
                ),
              },
            ].map((item, i) => (
              <FadeUp key={item.label} delay={0.1 + i * 0.08}>
                <div className="border border-[var(--border)] p-5">
                  <p className="mb-2 text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--text-muted)]">
                    {item.label}
                  </p>
                  {item.content}
                  {item.sub && (
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{item.sub}</p>
                  )}
                </div>
              </FadeUp>
            ))}

            <FadeUp delay={0.45}>
              <div className="border border-[var(--border)] bg-[var(--color-stone-950)] p-5">
                <p className="mb-2 text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--color-stone-500)]">
                  Özel Etkinlik
                </p>
                <p className="text-sm leading-relaxed text-[var(--color-stone-400)]">
                  Doğum günü, bekarlığa veda veya kurumsal ekip aktivitesi mi planlıyorsunuz?
                  Özel grup atölyeleri düzenliyoruz.
                </p>
                <p className="mt-2 text-xs text-[var(--color-stone-600)]">
                  Formda &ldquo;Özel etkinlik&rdquo; konusunu seçin.
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>

      {mapEmbedUrl && (
        <div className="w-full border-t border-[var(--border)]">
          <iframe
            src={mapEmbedUrl}
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Konum"
          />
        </div>
      )}
    </>
  );
}
