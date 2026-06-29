import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/storefront/page-hero";
import { FadeUp } from "@/components/ui/animate";

export const metadata: Metadata = { title: "Gizlilik Politikası | Atölye Biz" };

const sections = [
  {
    title: "1. Veri Sorumlusu",
    body: "Bu Gizlilik Politikası, Atölye Biz tarafından işletilen web sitesi ve hizmetlere ilişkin kişisel veri işleme faaliyetlerini kapsamaktadır. Veri sorumlusu olarak 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamındaki yükümlülüklerimizi yerine getiriyoruz.",
  },
  {
    title: "2. Toplanan Veriler",
    body: "Ad, soyad ve iletişim bilgileri (e-posta, telefon); rezervasyon ve ödeme bilgileri; web sitesi kullanım verileri (çerezler aracılığıyla); iletişim formlarından iletilen bilgiler.",
  },
  {
    title: "3. Verilerin Kullanım Amacı",
    body: "Rezervasyon işlemlerinin gerçekleştirilmesi, atölye programları hakkında bilgilendirme yapılması, müşteri hizmetleri sunulması ve yasal yükümlülüklerin yerine getirilmesi.",
  },
  {
    title: "4. Verilerin Saklanması",
    body: "Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve yasal saklama yükümlülükleri çerçevesinde saklanmaktadır. Rezervasyon verileri hizmetin tamamlanmasından itibaren 3 yıl boyunca saklanır.",
  },
  {
    title: "5. Haklarınız",
    body: "KVKK kapsamında kişisel verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini veya silinmesini talep etme haklarına sahipsiniz. Bu haklarınızı kullanmak için iletişim sayfamızı kullanabilirsiniz.",
  },
  {
    title: "6. Çerezler",
    body: "Web sitemiz, temel işlevsellik için zorunlu çerezler kullanmaktadır. Oturum yönetimi ve güvenlik amacıyla kullanılan bu çerezler tarayıcınızı kapattığınızda silinir.",
  },
];

export default function GizlilikPage() {
  return (
    <>
      <PageHero eyebrow="Yasal" title="Gizlilik Politikası" description="Son güncelleme: Haziran 2025" />

      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="flex flex-col gap-10">
          {sections.map((s, i) => (
            <FadeUp key={s.title} delay={i * 0.06}>
              <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-8">
                <h2 className="text-sm font-medium text-[var(--text-primary)]">{s.title}</h2>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{s.body}</p>
              </div>
            </FadeUp>
          ))}

          <FadeUp delay={0.4}>
            <div className="border-t border-[var(--border)] pt-8">
              <h2 className="mb-3 text-sm font-medium text-[var(--text-primary)]">7. İletişim</h2>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                Gizlilik politikamızla ilgili sorularınız için{" "}
                <Link href="/iletisim" className="underline underline-offset-4 hover:text-[var(--text-primary)]">
                  iletişim formunu
                </Link>{" "}
                kullanabilir veya{" "}
                <a href="tel:+905325175171" className="underline underline-offset-4 hover:text-[var(--text-primary)]">
                  +90 532 517 51 71
                </a>{" "}
                numaralı telefondan bize ulaşabilirsiniz.
              </p>
            </div>
          </FadeUp>
        </div>
      </div>
    </>
  );
}
