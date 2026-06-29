"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FadeUp } from "@/components/ui/animate";
import { PageHero } from "@/components/storefront/page-hero";
import { FAQAccordion } from "@/components/storefront/faq-accordion";

const ease = [0.16, 1, 0.3, 1] as const;

const FAQS = [
  {
    q: "Hiç deneyimim yok, başlayabilir miyim?",
    a: "Evet, kesinlikle! Atölyelerimizin büyük bölümü hiçbir deneyim gerektirmiyor. Başlangıç seviyesi programlarımız sıfırdan başlayanlar için özel olarak tasarlanmıştır. İlk derste tüm temel teknikleri öğretiyoruz.",
  },
  {
    q: "Derse hangi malzemeleri getirmem gerekiyor?",
    a: "Hiçbir şey getirmenize gerek yok. Tüm malzeme ve ekipman atölyemiz tarafından sağlanır. Derste yaptığınız takılar size aittir, evinize götürürsünüz.",
  },
  {
    q: "Grup büyüklüğü ne kadar?",
    a: "Atölyelerimizde maksimum 6 kişilik gruplarla çalışıyoruz. Bu sayede her katılımcıya yeterli ilgi ve rehberlik sunabiliyoruz.",
  },
  {
    q: "Rezervasyon yapmak için ödeme yapmak zorunda mıyım?",
    a: "Şu an için rezervasyonunuzu onaylamak ücretsizdir. Ödeme atölye günü nakit veya kredi kartıyla yapılabilir. Yakında online ödeme seçeneği de sunulacaktır.",
  },
  {
    q: "İptal veya değişiklik yapabilir miyim?",
    a: "Atölye tarihinden 48 saat öncesine kadar rezervasyonunuzu ücretsiz iptal edebilir veya tarih değiştirebilirsiniz. Daha geç iptal durumunda ücret politikamız için lütfen bize ulaşın.",
  },
  {
    q: "Sertifika programları ne kadar sürer?",
    a: "Sertifika programlarımız konuya göre 8 ila 24 haftalık modüller şeklinde sunulmaktadır. Program detay sayfasında süreyi görebilirsiniz.",
  },
  {
    q: "Atölye nerede bulunuyor?",
    a: "Atölyemiz İstanbul'dadır. Kesin adres bilgisi rezervasyon onayı sonrası tarafınıza iletilmektedir. Daha fazla bilgi için bize ulaşabilirsiniz.",
  },
  {
    q: "Özel etkinlik veya kurumsal eğitim düzenliyor musunuz?",
    a: "Evet! Doğum günü, bekarlığa veda gibi özel etkinlikler ile kurumsal ekip aktiviteleri için özel atölye düzenleyebiliyoruz. Detaylar için iletişim formunu kullanın.",
  },
  {
    q: "Çocuklar da katılabilir mi?",
    a: "16 yaş ve üzeri bireyler ebeveyn eşliğinde atölyelerimize katılabilmektedir. 18 yaş üzeri kısıtlama olmaksızın tüm programlara kayıt olunabilir.",
  },
  {
    q: "Derse katılamayacak olursam ne olur?",
    a: "48 saatten fazla önceden haber verirseniz yerinizi başka bir tarihe taşıyabiliyoruz. Sertifika programlarında kaçırılan dersler için telafi seçeneği sunulmaktadır.",
  },
];

export function SSSContent() {
  return (
    <>
      <PageHero
        eyebrow="Yardım"
        title="Sık Sorulan Sorular"
        description="Aklınızdaki soruların cevabını burada bulamazsanız bize yazın."
      />

      <div className="mx-auto max-w-3xl px-6 py-20">
        <FadeUp>
          <FAQAccordion items={FAQS} />
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="mt-16 flex flex-col items-center gap-4 border border-[var(--border)] bg-[var(--bg-subtle)] px-8 py-10 text-center">
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--text-muted)]">
              Hâlâ sorunuz var mı?
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Her soruyu buraya sığdıramıyoruz. Doğrudan ulaşın.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/iletisim"
                className="inline-flex h-10 items-center justify-center bg-[var(--text-primary)] px-6 text-xs font-medium tracking-[0.1em] uppercase text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)]"
              >
                Bize Yazın
              </Link>
              <a
                href="tel:+905325175171"
                className="inline-flex h-10 items-center justify-center border border-[var(--border-strong)] px-6 text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-primary)] transition-colors hover:bg-[var(--text-primary)] hover:text-[var(--surface)]"
              >
                +90 532 517 51 71
              </a>
            </div>
          </div>
        </FadeUp>
      </div>
    </>
  );
}
