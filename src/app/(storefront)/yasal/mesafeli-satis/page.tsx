import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/storefront/page-hero";
import { FadeUp } from "@/components/ui/animate";

export const metadata: Metadata = { title: "Mesafeli Satış Sözleşmesi | Atölye Biz" };

const MADDELER = [
  {
    title: "MADDE 1 – TARAFLAR",
    body: "SATICI: Atölye Biz, İstanbul, Türkiye. İletişim: +90 532 517 51 71\nALICI: Rezervasyon formunu dolduran ve hizmet satın alan kişi.",
  },
  {
    title: "MADDE 2 – KONU",
    body: "İşbu Mesafeli Satış Sözleşmesi, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında, ALICI'nın SATICI'ya ait internet sitesi üzerinden gerçekleştirdiği atölye/kurs rezervasyonu hizmetine ilişkin hak ve yükümlülükleri düzenlemektedir.",
  },
  {
    title: "MADDE 3 – HİZMET BİLGİLERİ",
    body: "Satın alınan hizmet; Atölye Biz tarafından sunulan takı tasarımı, kuyumculuk ve mücevher eğitimi atölyeleri ve sertifika programlarıdır. Hizmetin içeriği, süresi ve fiyatı rezervasyon sırasında katılımcıya açıklanmaktadır.",
  },
  {
    title: "MADDE 4 – ÖDEME",
    body: "Hizmet bedeli rezervasyon sırasında veya atölye günü nakit ya da kredi kartıyla ödenebilir. Online ödeme imkânı sunulduğunda ön bilgilendirme yapılacaktır.",
  },
  {
    title: "MADDE 5 – CAYMA HAKKI",
    body: "ALICI, hizmetin ifasına başlanmadan önce 14 gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Atölye tarihine 48 saatten az kalan durumlarda cayma hakkı kısıtlanmaktadır.",
  },
  {
    title: "MADDE 6 – ALICININ HAK VE YÜKÜMLÜLÜKLERİ",
    body: "ALICI, rezervasyon formunda doğru bilgi vermekle yükümlüdür. Atölye günü belirlenen saatte hazır bulunmak ALICI'nın sorumluluğundadır. Atölye kurallarına ve eğitmen yönlendirmelerine uymak zorunludur.",
  },
  {
    title: "MADDE 7 – UYUŞMAZLIK ÇÖZÜMÜ",
    body: "Bu sözleşmeden doğan uyuşmazlıklarda öncelikle taraflar arasında uzlaşma yolu aranır. Yetkili mahkeme İstanbul (Merkez) Mahkemeleridir.",
  },
  {
    title: "MADDE 8 – YÜRÜRLÜK",
    body: "ALICI, rezervasyonu tamamlayarak işbu sözleşmenin tüm maddelerini okuduğunu, anladığını ve kabul ettiğini beyan eder. Sözleşme, rezervasyonun onaylanmasıyla birlikte yürürlüğe girer.",
  },
];

export default function MesafeliSatisPage() {
  return (
    <>
      <PageHero eyebrow="Yasal" title="Mesafeli Satış Sözleşmesi" description="Son güncelleme: Haziran 2025" />

      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="flex flex-col gap-10">
          {MADDELER.map((m, i) => (
            <FadeUp key={m.title} delay={i * 0.05}>
              <div className="border-t border-[var(--border)] pt-8">
                <h2 className="mb-3 text-sm font-medium text-[var(--text-primary)]">{m.title}</h2>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-line">{m.body}</p>
              </div>
            </FadeUp>
          ))}

          <FadeUp delay={0.45}>
            <div className="border border-[var(--border)] bg-[var(--bg-subtle)] p-5 text-center">
              <p className="text-xs text-[var(--text-muted)]">
                Sorularınız için{" "}
                <Link href="/iletisim" className="underline underline-offset-4 hover:text-[var(--text-primary)]">
                  iletişim sayfası
                </Link>
                {" "}veya{" "}
                <a href="tel:+905325175171" className="underline underline-offset-4 hover:text-[var(--text-primary)]">
                  +90 532 517 51 71
                </a>
              </p>
            </div>
          </FadeUp>
        </div>
      </div>
    </>
  );
}
