import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/storefront/page-hero";
import { FadeUp } from "@/components/ui/animate";

export const metadata: Metadata = { title: "İptal ve İade Politikası | Atölye Biz" };

export default function IptalIadePage() {
  return (
    <>
      <PageHero eyebrow="Yasal" title="İptal ve İade" description="Son güncelleme: Haziran 2025" />

      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="flex flex-col gap-10">
          <FadeUp>
            <div className="border-t border-[var(--border)] pt-8">
              <h2 className="mb-5 text-sm font-medium text-[var(--text-primary)]">1. İptal Koşulları</h2>
              <div className="flex flex-col divide-y divide-[var(--border)] border border-[var(--border)]">
                {[
                  { zaman: "48 saat ve daha önce", durum: "Tam iade", color: "text-green-700" },
                  { zaman: "24–48 saat arası", durum: "%50 iade", color: "text-amber-700" },
                  { zaman: "24 saatten az", durum: "İade yapılmaz", color: "text-red-600" },
                ].map((row) => (
                  <div key={row.zaman} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-[var(--text-primary)]">{row.zaman}</span>
                    <span className={`text-sm font-medium ${row.color}`}>{row.durum}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>

          {[
            {
              title: "2. Tarih Değişikliği",
              body: "Rezervasyon tarihinden en az 48 saat önce bildirim yapılması koşuluyla, mevcut müsaitlik durumuna göre ücretsiz tarih değişikliği yapılabilmektedir. Bu hak her rezervasyon için yalnızca bir kez kullanılabilir.",
            },
            {
              title: "3. Atölye Tarafından İptal",
              body: "Atölye Biz'in herhangi bir nedenle programı iptal etmesi durumunda, ödenen tutarın tamamı 5 iş günü içinde iade edilir veya katılımcının talebi doğrultusunda başka bir tarihe aktarım yapılır.",
            },
            {
              title: "4. İade Süreci",
              body: "İade talepleri onaylandıktan sonra ödeme yapılan yönteme göre işleme alınır. Kredi kartı iadeleri 5–10 iş günü içinde kartınıza yansır. Nakit ödemelerde iade banka havalesi yoluyla gerçekleştirilir.",
            },
            {
              title: "5. Sertifika Programları",
              body: "Çok haftalı sertifika programlarında ayrı bir iptal politikası uygulanabilmektedir. Program başlamadan 7 gün öncesine kadar tam iade yapılır. Başladıktan sonra yapılan iptallerde kalan seans sayısına oranla iade hesaplanır.",
            },
          ].map((s, i) => (
            <FadeUp key={s.title} delay={(i + 1) * 0.07}>
              <div className="border-t border-[var(--border)] pt-8">
                <h2 className="mb-3 text-sm font-medium text-[var(--text-primary)]">{s.title}</h2>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{s.body}</p>
              </div>
            </FadeUp>
          ))}

          <FadeUp delay={0.45}>
            <div className="border-t border-[var(--border)] pt-8">
              <h2 className="mb-3 text-sm font-medium text-[var(--text-primary)]">6. İptal Talebi</h2>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                İptal taleplerinizi{" "}
                <Link href="/iletisim" className="underline underline-offset-4 hover:text-[var(--text-primary)]">
                  iletişim formu
                </Link>{" "}
                veya{" "}
                <a href="tel:+905325175171" className="underline underline-offset-4 hover:text-[var(--text-primary)]">
                  +90 532 517 51 71
                </a>{" "}
                ile iletebilirsiniz.
              </p>
            </div>
          </FadeUp>
        </div>
      </div>
    </>
  );
}
