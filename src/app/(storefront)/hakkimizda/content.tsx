"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FadeUp, FadeIn } from "@/components/ui/animate";
import { PageHero } from "@/components/storefront/page-hero";

const ease = [0.16, 1, 0.3, 1] as const;

const VALUES = [
  { title: "Küçük Gruplar", text: "Maksimum 6 kişilik gruplar. Her öğrenciye özel ilgi, kişisel gelişim." },
  { title: "Kaliteli Malzeme", text: "Gerçek gümüş, altın ve değerli taşlarla çalışıyoruz. Öğrendiğiniz takıları eve götürüyorsunuz." },
  { title: "Deneyimli Eğitmenler", text: "Yıllarca sektörde çalışmış ustaların rehberliğinde, doğru tekniklerle öğrenin." },
  { title: "Her Seviyeye Uygun", text: "Hiç deneyiminiz olmasa da başlayabilirsiniz. Başlangıçtan ileri düzeye programlar." },
  { title: "Sertifikalı Eğitim", text: "Tamamladığınız sertifika programları için resmi belge düzenliyoruz." },
  { title: "Güvenli Atölye", text: "Profesyonel ekipman, güvenli çalışma ortamı ve sürekli gözetim." },
];

export function HakkimizdaContent() {
  return (
    <>
      <PageHero
        eyebrow="Hikayemiz"
        title="Hakkımızda"
        description="Takı Tasarım Kursu ve Kuyumculuk Eğitimleri alanında İstanbul'un köklü atölyelerinden biriyiz."
      />

      {/* Pull quote */}
      <section className="border-b border-[var(--border)] bg-[var(--bg-subtle)] px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <FadeUp>
            <p className="text-2xl font-light leading-relaxed text-[var(--text-primary)] sm:text-3xl">
              &ldquo;Takı; metal ile emeğin buluştuğu andır.
              <br />
              <em className="not-italic" style={{ color: "var(--color-warm-500)" }}>
                Biz o anı öğretiyoruz.
              </em>
              &rdquo;
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20 lg:items-center">
          <FadeUp>
            <div className="relative aspect-[4/3] overflow-hidden border border-[var(--border)] bg-[var(--bg-muted)]">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-disabled)]">
                  Atölye fotoğrafı
                </span>
              </div>
              {/* Decorative corner lines */}
              <div className="absolute top-4 left-4 h-8 w-8 border-t border-l border-[var(--color-warm-400)] opacity-60" />
              <div className="absolute bottom-4 right-4 h-8 w-8 border-b border-r border-[var(--color-warm-400)] opacity-60" />
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <p className="mb-5 text-[10px] font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">
              Başlangıç
            </p>
            <h2 className="mb-6 text-3xl font-light leading-snug tracking-tight text-[var(--text-primary)]">
              Her takıda bir emeğin,<br />bir anın izi var.
            </h2>
            <p className="mb-4 leading-relaxed text-[var(--text-secondary)]">
              2016 yılında küçük bir takı merakıyla başlayan bu yolculuk,
              bugün yüzlerce öğrencinin kendi tasarım sesini bulduğu bir atölyeye dönüştü.
              Gümüş, altın, taş işleme ve mücevher tasarımının farklı dallarında eğitimler sunuyoruz.
            </p>
            <p className="mb-8 leading-relaxed text-[var(--text-secondary)]">
              Atölyemizde maksimum 6 kişilik gruplarla çalışıyoruz. Bu sayede her öğrenciye
              kişisel ilgi gösteriyor, kendi hızında ilerlemesine olanak tanıyoruz.
            </p>
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Bize ulaşın
              <span aria-hidden>→</span>
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-[var(--color-stone-800)] bg-[var(--color-stone-950)] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <FadeUp className="mb-14">
            <p className="mb-4 text-[10px] font-medium tracking-[0.3em] uppercase text-[var(--color-stone-500)]">
              Değerlerimiz
            </p>
            <h2 className="text-3xl font-light tracking-tight text-[var(--color-stone-50)]">
              Neden Atölye Biz?
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 gap-px bg-[var(--color-stone-800)] sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v, i) => (
              <FadeUp key={v.title} delay={i * 0.07}>
                <div className="flex flex-col gap-3 bg-[var(--color-stone-950)] p-6 h-full">
                  <div className="h-px w-8 bg-[var(--color-warm-500)]" />
                  <h3 className="text-sm font-medium text-[var(--color-stone-100)]">{v.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--color-stone-500)]">{v.text}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <FadeUp className="mb-14">
          <p className="mb-4 text-[10px] font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">
            Ekibimiz
          </p>
          <h2 className="text-3xl font-light tracking-tight text-[var(--text-primary)]">
            Ustalarla tanışın
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Biz",
              role: "Baş Eğitmen & Kurucu",
              bio: "10 yılı aşkın kuyumculuk deneyimiyle gümüş ve altın işleme konusunda uzmanlaşmış.",
            },
          ].map((member, i) => (
            <FadeUp key={member.name} delay={i * 0.1}>
              <div className="group flex flex-col gap-4">
                <div className="relative aspect-square overflow-hidden border border-[var(--border)] bg-[var(--bg-muted)]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-disabled)]">
                      Fotoğraf
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-[var(--color-warm-500)]/0 transition-colors duration-500 group-hover:bg-[var(--color-warm-500)]/5" />
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{member.name}</p>
                  <p className="text-xs text-[var(--accent)]">{member.role}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {member.bio}
                  </p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-[var(--border)] bg-[var(--bg-subtle)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 divide-x divide-y divide-[var(--border)] sm:grid-cols-4 sm:divide-y-0">
            {[
              { value: "2016", label: "Kuruluş Yılı" },
              { value: "1.200+", label: "Mezun Öğrenci" },
              { value: "≤6", label: "Kişilik Gruplar" },
              { value: "100+", label: "Program" },
            ].map((s, i) => (
              <FadeIn key={s.label} delay={i * 0.08}>
                <div className="flex flex-col items-center gap-1 py-8 px-4">
                  <span className="text-2xl font-light text-[var(--text-primary)] sm:text-3xl">
                    {s.value}
                  </span>
                  <span className="text-center text-[11px] text-[var(--text-muted)]">{s.label}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--color-stone-950)] px-6 py-28">
        <div className="mx-auto max-w-6xl text-center">
          <FadeUp>
            <p className="mb-4 text-[10px] font-medium tracking-[0.35em] uppercase text-[var(--color-stone-500)]">
              Bize Katılın
            </p>
            <h2 className="mb-8 text-3xl font-light tracking-tight text-[var(--color-stone-50)] sm:text-4xl">
              Kendi takınızı tasarlayın.
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/atolyeler"
                className="inline-flex h-12 items-center justify-center bg-[var(--color-warm-400)] px-8 text-xs font-medium tracking-[0.15em] uppercase text-[var(--color-stone-950)] transition-colors hover:bg-[var(--color-warm-300)]"
              >
                Atölyeleri İncele
              </Link>
              <Link
                href="/iletisim"
                className="inline-flex h-12 items-center justify-center border border-[var(--color-stone-700)] px-8 text-xs font-medium tracking-[0.15em] uppercase text-[var(--color-stone-400)] transition-colors hover:border-[var(--color-stone-500)] hover:text-[var(--color-stone-200)]"
              >
                İletişime Geç
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
