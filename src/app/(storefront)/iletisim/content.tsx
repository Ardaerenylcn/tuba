"use client";

import { motion } from "framer-motion";
import { FadeUp } from "@/components/ui/animate";
import { ContactForm } from "@/components/storefront/contact-form";
import type { ContactConfig } from "@/lib/site-content";

const ease = [0.16, 1, 0.3, 1] as const;

export function IletisimContent({
  mapEmbedUrl,
  config,
}: {
  mapEmbedUrl: string | null;
  config: ContactConfig;
}) {
  const iletisimBilgileri = [
    {
      ikon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5" aria-hidden>
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.79 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
        </svg>
      ),
      baslik: "Telefon",
      icerik: (
        <a
          href={`tel:${config.phone.replace(/\s/g, "")}`}
          className="text-[15px] font-medium text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          {config.phone}
        </a>
      ),
      alt: `Hafta içi ${config.weekdays}`,
    },
    {
      ikon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5" aria-hidden>
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      ),
      baslik: "WhatsApp",
      icerik: (
        <a
          href={`https://wa.me/${config.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[15px] font-medium text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          WhatsApp ile yaz →
        </a>
      ),
      alt: "Genellikle birkaç saat içinde yanıt",
    },
    {
      ikon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5" aria-hidden>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
      ),
      baslik: "Konum",
      icerik: (
        <p className="text-[15px] text-[var(--text-secondary)]">{config.location}</p>
      ),
      alt: "Kesin adres rezervasyon onayından sonra iletilir",
    },
    {
      ikon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-5 h-5" aria-hidden>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
      baslik: "Instagram",
      icerik: (
        <a
          href={`https://instagram.com/${config.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[15px] font-medium text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          @{config.instagram} →
        </a>
      ),
      alt: "Atölye günlerini takip edin",
    },
  ];

  return (
    <>
      {/* ── Başlık bölümü ───────────────────────────────────────────────── */}
      <section className="bg-[var(--bg-subtle)] border-b border-[var(--border)] py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="mb-4 text-[10px] font-medium tracking-[0.35em] uppercase text-[var(--text-muted)]"
          >
            Bize Ulaşın
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.18, ease }}
            className="mb-5 text-[var(--text-primary)]"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontWeight: 700,
              fontSize: "clamp(2.8rem, 7vw, 5rem)",
              lineHeight: 1.05,
            }}
          >
            İletişim
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease }}
            className="max-w-lg text-[15px] leading-relaxed text-[var(--text-secondary)]"
          >
            Sorularınız, rezervasyon talepleriniz veya özel etkinlik planlamanız
            için buradayız. En kısa sürede size dönüş yapacağız.
          </motion.p>
        </div>
      </section>

      {/* ── İletişim bilgileri şeridi ────────────────────────────────────── */}
      <section className="bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 divide-x divide-y divide-[var(--border)] lg:grid-cols-4 lg:divide-y-0">
            {iletisimBilgileri.map((item, i) => (
              <FadeUp key={item.baslik} delay={i * 0.08}>
                <div className="flex flex-col gap-3 p-8">
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    {item.ikon}
                    <span className="text-[10px] font-medium tracking-[0.2em] uppercase">
                      {item.baslik}
                    </span>
                  </div>
                  {item.icerik}
                  {item.alt && (
                    <p className="text-[11px] text-[var(--text-muted)]">{item.alt}</p>
                  )}
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form + Özel etkinlik ─────────────────────────────────────────── */}
      <section className="bg-[var(--bg)] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_380px]">

            {/* Sol — Form */}
            <FadeUp>
              <p className="mb-2 text-[10px] font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">
                Mesaj Gönder
              </p>
              <h2
                className="mb-8 text-[var(--text-primary)]"
                style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontWeight: 600,
                  fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                }}
              >
                Formu doldurun, size dönelim.
              </h2>
              <ContactForm />
            </FadeUp>

            {/* Sağ — Özel etkinlik + SSS */}
            <div className="flex flex-col gap-6">
              {/* Özel etkinlik kartı */}
              <FadeUp delay={0.15}>
                <div className="bg-[var(--bg-subtle)] border border-[var(--border)] p-8">
                  <div className="h-px w-8 bg-[var(--border-strong)] mb-6" />
                  <p className="mb-2 text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--text-muted)]">
                    Özel Etkinlik
                  </p>
                  <h3
                    className="mb-4 text-[var(--text-primary)]"
                    style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontWeight: 600,
                      fontSize: "1.3rem",
                    }}
                  >
                    Grup atölyesi mi planlıyorsunuz?
                  </h3>
                  <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
                    Doğum günü, bekarlığa veda veya kurumsal ekip aktivitesi için
                    özel grup atölyeleri düzenliyoruz. Formda &ldquo;Özel
                    etkinlik / kurumsal&rdquo; konusunu seçin.
                  </p>
                </div>
              </FadeUp>

              {/* Çalışma saatleri */}
              <FadeUp delay={0.25}>
                <div className="border border-[var(--border)] p-8">
                  <div className="h-px w-8 bg-[var(--border-strong)] mb-6" />
                  <p className="mb-4 text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--text-muted)]">
                    Çalışma Saatleri
                  </p>
                  <div className="flex flex-col gap-3">
                    {[
                      { gun: "Pazartesi – Cuma", saat: config.weekdays },
                      { gun: "Cumartesi", saat: config.saturday },
                      { gun: "Pazar", saat: config.sunday },
                    ].map((r) => (
                      <div key={r.gun} className="flex items-center justify-between">
                        <span className="text-[13px] text-[var(--text-secondary)]">{r.gun}</span>
                        <span className="text-[13px] font-medium text-[var(--text-primary)]">{r.saat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeUp>

              {/* SSS kısa bağlantı */}
              <FadeUp delay={0.35}>
                <div className="border border-[var(--border)] p-8 flex items-center justify-between group">
                  <div>
                    <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--text-muted)] mb-1">
                      Sık Sorulan Sorular
                    </p>
                    <p className="text-[13px] text-[var(--text-secondary)]">
                      Cevabınızı hızlıca bulabilirsiniz.
                    </p>
                  </div>
                  <a
                    href="/sss"
                    className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors text-lg"
                    aria-label="SSS sayfasına git"
                  >
                    →
                  </a>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* ── Harita ──────────────────────────────────────────────────────── */}
      {mapEmbedUrl ? (
        <div className="w-full border-t border-[var(--border)]">
          <iframe
            src={mapEmbedUrl}
            width="100%"
            height="420"
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Konum haritası"
          />
        </div>
      ) : (
        /* Harita yoksa dekoratif bant */
        <section className="bg-[var(--bg-subtle)] border-t border-[var(--border)] py-16 px-6">
          <div className="mx-auto max-w-7xl text-center">
            <FadeUp>
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--text-muted)] mb-3">
                Bizi Takip Edin
              </p>
              <p
                className="text-[var(--text-primary)]"
                style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "1.5rem",
                  fontWeight: 300,
                }}
              >
                Atölye anlarını Instagram&apos;dan izleyin. ♥
              </p>
              <a
                href={`https://instagram.com/${config.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex h-11 items-center justify-center border border-[var(--border-strong)] px-8 text-[11px] font-medium tracking-[0.15em] uppercase text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Instagram&apos;ı Ziyaret Et →
              </a>
            </FadeUp>
          </div>
        </section>
      )}
    </>
  );
}
