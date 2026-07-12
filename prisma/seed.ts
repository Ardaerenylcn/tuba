import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter } as never);

async function main() {
  console.log("Temizleniyor...");

  await db.payment.deleteMany();
  await db.reservation.deleteMany();
  await db.workshopSession.deleteMany();
  await db.programFaq.deleteMany();
  await db.programRequirement.deleteMany();
  await db.program.deleteMany();

  console.log("Kategoriler güncelleniyor...");

  const updateCat = async (slug: string, name: string, description: string, sortOrder: number) => {
    await db.programCategory.upsert({
      where: { slug },
      update: { name, description, sortOrder, showOnHome: true, isActive: true },
      create: { slug, name, description, sortOrder, showOnHome: true, isActive: true },
    });
  };

  await updateCat("atolyeler", "Atölyeler", "El yapımı takı atölyeleri — başlangıçtan ileri seviyeye", 0);
  await updateCat("sertifikalar", "Sertifikalar", "Kapsamlı sertifika programları — profesyonel takı tasarımcısı olun", 1);
  await updateCat("masterclass", "Masterclass", "Usta sanatçılarla yoğun tek günlük masterclass deneyimi", 2);

  const atolyeler = await db.programCategory.findUnique({ where: { slug: "atolyeler" } });
  const sertifikalar = await db.programCategory.findUnique({ where: { slug: "sertifikalar" } });
  const masterclass = await db.programCategory.findUnique({ where: { slug: "masterclass" } });

  console.log("Programlar ekleniyor...");

  // ────────────────────────────────────────────
  // A1 — Temel Takı Tasarımı
  // ────────────────────────────────────────────
  const temel = await db.program.create({
    data: {
      id: "prog_atolye_temel",
      type: "atolyeler",
      categoryId: atolyeler!.id,
      title: "Temel Takı Tasarımı",
      slug: "temel-taki-tasarimi",
      shortDescription:
        "Takı tasarımına ilk adımı atmak isteyenler için. Tel sarma, boncuk dizimi ve temel metal çalışmalarını keşfedeceğiniz keyifli bir başlangıç atölyesi.",
      description: {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "Bu atölye, ellerinizle bir şeyler yaratmanın mutluluğunu keşfetmek isteyenler için tasarlandı. Malzeme bilgisinden araç kullanımına, tel sarma tekniklerinden boncuk dizim sistemlerine kadar takı yapımının temellerini öğreneceksiniz." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Bu Atölyede Neler Öğreneceksiniz?" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Gümüş, bakır ve pirinç tel kullanımı" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Temel sarma ve kıvırma teknikleri" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Boncuk seçimi ve dizim yöntemleri" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Kanca ve kilit yapımı" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Güvenli araç kullanımı ve atölye düzeni" }] }] },
          ] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Kimler Katılabilir?" }] },
          { type: "paragraph", content: [{ type: "text", text: "Hiç takı deneyimi olmayanlar da dahil olmak üzere herkese açık bir atölyedir. 15 yaş ve üzeri katılabilir. Tüm malzeme ve araçlar tarafımızca sağlanmaktadır." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Atölye Sonunda Elinize Ne Geçer?" }] },
          { type: "paragraph", content: [{ type: "text", text: "Atölye boyunca hazırladığınız en az iki adet takıyı (küpe veya bileklik) evinize götürürsünüz. Ayrıca ilerleyen süreçte evde uygulayabileceğiniz teknik notlar ve malzeme listesi verilir." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Detaylar" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Süre: 2 saat" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Grup: Maksimum 8 kişi" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Tüm malzeme dahil" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Çay ve kurabiye ikramı" }] }] },
          ] },
        ],
      },
      basePrice: 1800,
      currency: "TRY",
      defaultCapacity: 8,
      durationMinutes: 120,
      level: "beginner",
      status: "published",
      seoTitle: "Temel Takı Tasarımı Atölyesi | Tuba Atman Jewelry",
      seoDescription: "Takı yapımına başlangıç atölyesi. Tel sarma, boncuk dizimi ve temel metal çalışmaları. İstanbul Kadıköy.",
    },
  });

  // A2 — Gümüş Yüzük Atölyesi
  const yuzuk = await db.program.create({
    data: {
      id: "prog_atolye_yuzuk",
      type: "atolyeler",
      categoryId: atolyeler!.id,
      title: "Gümüş Yüzük Atölyesi",
      slug: "gumus-yuzuk-atolyesi",
      shortDescription:
        "Kendi gümüş yüzüğünüzü tasarlayın ve lehimleme tekniğiyle üretin. Boyutlandırma, yüzey işleme ve parlatmayı birebir öğreneceğiniz orta seviye bir atölye.",
      description: {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "Gümüş ile çalışmanın kendine has ritmi ve hissi vardır. Bu atölyede 925 ayar gümüşü nasıl şekillendireceğinizi, yüzeye nasıl doku kazıyacağınızı ve profesyonel bir parlaklık nasıl elde edeceğinizi öğreneceksiniz." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Süreç" }] },
          { type: "paragraph", content: [{ type: "text", text: "Atölyemizde önce kağıt üzerinde yüzük tasarımınızı çizecek, ardından 925 ayar gümüş şerit ile çalışmaya başlayacaksınız. Lehimleme, boyutlandırma, eğeleme ve parlatma aşamalarını tamamlayarak atölyeden kendi ürettiğiniz yüzükle ayrılacaksınız." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Öğrenecekleriniz" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "925 ayar gümüş ile çalışma teknikleri" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Gümüş kesim ve şekillendirme" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Lehimleme: gümüş lehim ve pürmüz kullanımı" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Yüzük boyutlandırma ve ayarlama" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Mat, doku ve parlak yüzey efektleri" }] }] },
          ] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Kimler İçin?" }] },
          { type: "paragraph", content: [{ type: "text", text: "En az bir temel takı atölyesine katılmış ya da evde küçük çaplı metal çalışmaları yapmış olanlar için uygundur. Tamamen yeni başlayanlar için önce Temel Takı Tasarımı atölyesini öneririz." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Dahil Olanlar" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "925 ayar gümüş malzeme (3-5 gr)" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Tüm alet ve ekipman" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Türk kahvesi ve çerez ikramı" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Yüzüğünüz için bez torba" }] }] },
          ] },
        ],
      },
      basePrice: 2800,
      currency: "TRY",
      defaultCapacity: 6,
      durationMinutes: 180,
      level: "intermediate",
      status: "published",
      seoTitle: "Gümüş Yüzük Atölyesi | Tuba Atman Jewelry",
      seoDescription: "Kendi gümüş yüzüğünüzü yapın. Lehimleme, yüzey işleme ve parlatma. Küçük gruplar, Kadıköy İstanbul.",
    },
  });

  // A3 — Taş Kakma Teknikleri
  const takkakma = await db.program.create({
    data: {
      id: "prog_atolye_takkakma",
      type: "atolyeler",
      categoryId: atolyeler!.id,
      title: "Taş Kakma Teknikleri",
      slug: "tas-kakma-teknikleri",
      shortDescription:
        "Değerli ve yarı değerli taşları gümüş çerçeveler içine nasıl yerleştireceğinizi öğrenin. Kollet, bezel ve prong kakma yöntemlerini uygulamalı keşfedin.",
      description: {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "Bir taşın mücevher içindeki yeri, tüm tasarımın ruhunu belirler. Bu atölyede taşları güvenli ve estetik biçimde metallere sabitlemek için kullanılan üç temel kakma tekniğini öğreneceksiniz: kollet, bezel ve prong." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Kakma Teknikleri" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Kollet kakma: Taşı saran tam çerçeve tekniği" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Bezel kakma: Düz şerit ile montaj" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Prong kakma: Pençe tipi metal tutucular" }] }] },
          ] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Atölyede Neler Yapacaksınız?" }] },
          { type: "paragraph", content: [{ type: "text", text: "Her katılımcı, kendi seçtiği yarı değerli taşı (ametist, kuvars, turkuaz veya labradorit) için gümüş çerçeve hazırlayacak ve tekniği uygulayacaktır. Atölye boyunca bir adet kolye ucu veya yüzük taşı kakılmış parça tamamlanacaktır." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Ön Koşullar" }] },
          { type: "paragraph", content: [{ type: "text", text: "Lehimleme konusunda temel bilgi gerekmektedir. Gümüş Yüzük Atölyesi veya benzeri bir metal çalışma deneyimi tavsiye edilir." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Dahil Olanlar" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Seçiminize göre yarı değerli taş" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "925 gümüş malzeme ve sarf malzemeler" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Teknik el kitapçığı (PDF)" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "İkram ve atölye önlüğü" }] }] },
          ] },
        ],
      },
      basePrice: 3500,
      currency: "TRY",
      defaultCapacity: 5,
      durationMinutes: 180,
      level: "advanced",
      status: "published",
      seoTitle: "Taş Kakma Teknikleri Atölyesi | Tuba Atman Jewelry",
      seoDescription: "Kollet, bezel ve prong kakma tekniklerini öğrenin. Değerli taşları gümüş ile buluşturun. İleri seviye atölye.",
    },
  });

  // A4 — Bakır Dövme Atölyesi
  const bakir = await db.program.create({
    data: {
      id: "prog_atolye_bakir",
      type: "atolyeler",
      categoryId: atolyeler!.id,
      title: "Bakır Dövme Atölyesi",
      slug: "bakir-dovme-atolyesi",
      shortDescription:
        "Bakır plakaları çekiç ve kalıplarla şekillendirerek özgün takılar yaratın. Dövme tekniğinin ritmi ve sezgisel yaratıcılığını keşfettiğiniz rahatlatıcı bir atölye.",
      description: {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "Bakır dövme, takı yapımının en meditasyon benzeri koludur. Çekicin ritmi, metalin değişen rengi ve ortaya çıkan dokunun biricikliği sizi birkaç saatliğine günlük hayattan koparır." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Ne Yapacaksınız?" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Bakır plaka seçimi ve kesimi" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Çekiçleme ve dövme doku teknikleri" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Şekillendirme: kaşık ve çubuk kalıplar" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Bakıra patina ve renk efektleri" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Son işlem ve cilalama" }] }] },
          ] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Neden Bakır?" }] },
          { type: "paragraph", content: [{ type: "text", text: "Bakır, uygun fiyatı ve işlenme kolaylığıyla takı tasarımını öğrenmek için mükemmel bir metal. Rengi ve sıcaklığı ayrıca ona eşsiz bir estetik kazandırıyor. Bu atölyeden sonra bakır ile çalışmaya evde devam edebilirsiniz." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Detaylar" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Süre: 2,5 saat" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Seviye: Başlangıç — herkes katılabilir" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Tüm malzeme dahil" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Atölye sonu fotoğraf seansı" }] }] },
          ] },
        ],
      },
      basePrice: 1500,
      currency: "TRY",
      defaultCapacity: 8,
      durationMinutes: 150,
      level: "beginner",
      status: "published",
      seoTitle: "Bakır Dövme Atölyesi | Tuba Atman Jewelry",
      seoDescription: "Bakır plakaları çekiç ve kalıplarla şekillendirin. Başlangıç seviyesi, tüm malzeme dahil. İstanbul Kadıköy.",
    },
  });

  // A5 — Tel Sarma Sanatı
  const tel = await db.program.create({
    data: {
      id: "prog_atolye_tel",
      type: "atolyeler",
      categoryId: atolyeler!.id,
      title: "Tel Sarma Sanatı",
      slug: "tel-sarma-sanati",
      shortDescription:
        "İnce gümüş ve bakır tellerle karmaşık sarma desenleri oluşturun. Taş sarmadan dekoratif kolye uçlarına kadar wire wrapping tekniğini özgünce kullanmayı öğrenin.",
      description: {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "Tel sarma, herhangi bir lehim ya da ısı gerektirmeden sadece tel ve pense ile inanılmaz karmaşıklıkta takılar üretebileceğiniz bir tekniktir. Sabır, ritim ve biraz da pratikle kısa sürede etkileyici sonuçlar alabilirsiniz." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Teknikler" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Temel sarma ve bükme hareketleri" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Taş çevresinde serbest form sarma" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Dekoratif spiral ve örgü desenleri" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Kolye ucu, küpe ve yüzük uygulamaları" }] }] },
          ] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Atölye Planı" }] },
          { type: "paragraph", content: [{ type: "text", text: "İlk yarım saat ısınma egzersizleri ile geçecek. Ardından her katılımcı küçük bir sarma egzersizi tamamlayacak, ikinci bölümde kendi seçtiği taş için kolye ucu saracaktır. Atölye sonunda kendi tasarladığınız tel sarmalı kolye ucu ile bir adet küpe tamamlanmış olacak." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Dahil Olanlar" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Gümüş kaplama ve bakır tel" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Kuvars, ametist veya sitrin taş seçeneği" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Pense seti kullanımı" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Teknik diyagramlı not defteri" }] }] },
          ] },
        ],
      },
      basePrice: 2200,
      currency: "TRY",
      defaultCapacity: 8,
      durationMinutes: 150,
      level: "beginner",
      status: "published",
      seoTitle: "Tel Sarma (Wire Wrapping) Atölyesi | Tuba Atman Jewelry",
      seoDescription: "Lehim gerektirmeyen tel sarma tekniğiyle taş kolye ucu ve küpe yapın. Başlangıç seviyesi, İstanbul Kadıköy.",
    },
  });

  // S1 — Temel Kuyumculuk Sertifikası
  const sertTemel = await db.program.create({
    data: {
      id: "prog_sertifika_temel",
      type: "sertifikalar",
      categoryId: sertifikalar!.id,
      title: "Temel Kuyumculuk Sertifikası",
      slug: "temel-kuyumculuk-sertifikasi",
      shortDescription:
        "8 haftalık kapsamlı bir program. Metal kesimden lehimlemeye, taş kakma tekniklerinden yüzey işlemeye kadar profesyonel kuyumculuğun temellerini edinin ve sertifikanızı alın.",
      description: {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "Bu program, takı yapımını gerçek anlamda öğrenmek isteyen ve bunu bir mesleğe ya da ciddi bir hobiye dönüştürmeyi düşünenler için tasarlandı. 8 hafta boyunca haftada iki gün, toplamda 16 seans boyunca kuyumculuğun temel disiplinlerini sistematik bir şekilde öğreneceksiniz." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Program Müfredatı" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Hafta 1-2: Metalurji temelleri, araç tanıma, güvenlik ve kesim teknikleri" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Hafta 3-4: Lehimleme, bükme ve form çalışmaları" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Hafta 5-6: Taş kakma (kollet ve bezel), asit işleme" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Hafta 7: Yüzey işleme, patina ve parlatma" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Hafta 8: Bitirme projesi ve sertifika değerlendirmesi" }] }] },
          ] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Sertifika" }] },
          { type: "paragraph", content: [{ type: "text", text: "Program sonunda Tuba Atman Jewelry tarafından düzenlenen ve Avrupa Kuyumcular Birliği (EJA) standartlarına uygun temel kuyumculuk sertifikası verilmektedir. Bu sertifika kuyumcu atölyeleri ve tasarım stüdyoları tarafından tanınmaktadır." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Program Detayları" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Süre: 8 hafta, haftada 2 gün (Salı ve Perşembe)" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Seans süresi: Günlük 3 saat" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Grup: Maksimum 5 kişi" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Tüm malzeme ve alet kullanımı dahil" }] }] },
          ] },
        ],
      },
      basePrice: 12000,
      currency: "TRY",
      defaultCapacity: 5,
      durationMinutes: 180,
      level: "beginner",
      status: "published",
      seoTitle: "Temel Kuyumculuk Sertifikası | Tuba Atman Jewelry",
      seoDescription: "8 haftalık profesyonel kuyumculuk sertifika programı. Uluslararası geçerli sertifika. İstanbul Kadıköy.",
    },
  });

  // S2 — İleri Takı Tasarımı Sertifikası
  const sertIleri = await db.program.create({
    data: {
      id: "prog_sertifika_ileri",
      type: "sertifikalar",
      categoryId: sertifikalar!.id,
      title: "İleri Takı Tasarımı Sertifikası",
      slug: "ileri-taki-tasarimi-sertifikasi",
      shortDescription:
        "12 haftalık ileri düzey program. Mücevher tasarım yazılımı, döküm teknikleri, elmas ve değerli taş işçiliği ile koleksiyon geliştirmeyi öğrenin.",
      description: {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "Temel kuyumculuk bilgisine sahip olup kendini bir sonraki seviyeye taşımak isteyenler için hazırlanan bu program; döküm, gravür, elmas işçiliği ve koleksiyon tasarımı gibi ileri disiplinleri kapsamaktadır. 12 hafta sonunda bireysel bir koleksiyon portföyüyle mezun olacaksınız." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Müfredat Özeti" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Mücevher tasarım yazılımına giriş (Rhinoceros 3D)" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Kum ve ağaç döküm teknikleri" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Pırlanta ve değerli taş sınıflandırması" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Pave ve kanal kakma teknikleri" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Koleksiyon geliştirme ve mood board hazırlama" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Bitirme sergisi ve sertifika töreni" }] }] },
          ] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Kimler Başvurabilir?" }] },
          { type: "paragraph", content: [{ type: "text", text: "Temel Kuyumculuk Sertifikası mezunları ya da en az 1 yıl düzenli metal çalışması deneyimi olanlar başvurabilir. Programa kabul için kısa bir portfolyo değerlendirmesi yapılmaktadır." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Program Bilgileri" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Süre: 12 hafta, haftada 2 gün" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Günlük seans: 3,5 saat" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Grup: Maksimum 4 kişi" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Bitirme sergisi için mekan ve organizasyon dahil" }] }] },
          ] },
        ],
      },
      basePrice: 18000,
      currency: "TRY",
      defaultCapacity: 4,
      durationMinutes: 210,
      level: "intermediate",
      status: "published",
      seoTitle: "İleri Takı Tasarımı Sertifikası | Tuba Atman Jewelry",
      seoDescription: "12 haftalık ileri kuyumculuk sertifika programı. Döküm, değerli taş işçiliği, 3D tasarım. İstanbul.",
    },
  });

  // M1 — Filigran Masterclass
  const filigran = await db.program.create({
    data: {
      id: "prog_master_filigran",
      type: "masterclass",
      categoryId: masterclass!.id,
      title: "Filigran: Kaybolmayan Sanat",
      slug: "filigran-kaybolmayan-sanat",
      shortDescription:
        "Osmanlı dönemine uzanan filigran tekniğini Tuba Atman ile birebir öğrenin. İnce gümüş teller örülerek oluşturulan bu narin dantel işçiliği 5 saatlik yoğun bir masterclass deneyimi.",
      description: {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "Filigran, Türk-Osmanlı kuyumculuğunun en narin ve emek yoğun dalıdır. İnce gümüş tellerin birbirine örgülerek, bükülerek ve lehimlenerek oluşturduğu bu şeffaf dantel işçiliği onlarca yılda ustadan öğrenciye aktarılabilmektedir. Bu masterclass'ta Tuba Atman, tekniğin hem tarihini hem de üretim sırlarını sizinle paylaşacak." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Gün Planı" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "09:00-10:00 — Filigranın tarihi, örnekler ve teknik tanıtım" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "10:00-12:00 — Tel hazırlama, örgü ve temel form oluşturma" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "12:00-12:30 — Öğle arası (yemek dahil)" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "12:30-14:30 — Kendi filigran parçanızı bitirme" }] }] },
          ] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Katılımcı Profili" }] },
          { type: "paragraph", content: [{ type: "text", text: "Filigran sabır ve ince el becerisine dayandığından deneyimli katılımcılara önerilir. Ancak sanata gönül vermiş herkes deneyebilir; Tuba Hanım her seviyeye göre tempo ayarlar." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Dahil Olanlar" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Tüm malzeme ve alet kullanımı" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Öğle yemeği ve ikramlar" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Katılım sertifikası" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Fotoğraflı atölye anı kitapçığı" }] }] },
          ] },
        ],
      },
      basePrice: 4500,
      currency: "TRY",
      defaultCapacity: 4,
      durationMinutes: 300,
      level: "advanced",
      status: "published",
      seoTitle: "Filigran Masterclass | Tuba Atman Jewelry",
      seoDescription: "Osmanlı geleneğinden filigran tekniğini öğrenin. Tuba Atman ile 5 saatlik yoğun masterclass. Öğle yemeği dahil.",
    },
  });

  // M2 — Kişisel Hikaye Kolyesi Masterclass
  const kolye = await db.program.create({
    data: {
      id: "prog_master_kolye",
      type: "masterclass",
      categoryId: masterclass!.id,
      title: "Kişisel Hikaye Kolyesi",
      slug: "kisisel-hikaye-kolyesi",
      shortDescription:
        "Kendi anınızı ya da sembolünüzü taşıyan, tamamen size özgü bir kolye tasarlayın. Konsept geliştirmeden üretimine kadar Tuba Atman rehberliğinde tamamlanan 4 saatlik özel bir masterclass.",
      description: {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "Her takının bir hikayesi olmalı. Bu masterclass'ta kendi anlam yüklü sembolünüzü, bir tarihi, bir harfi ya da soyut bir formu gerçek bir kolyeye dönüştüreceksiniz. Tüm tasarım süreci size ait olacak; Tuba Atman bu süreçte sadece rehberiniz ve ustanız olacak." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Nasıl Çalışır?" }] },
          { type: "paragraph", content: [{ type: "text", text: "Katılımdan 1 hafta önce tarafınıza kısa bir form gönderilir. Bu formda kolye için anlamlı bulduğunuz bir anı, nesne, sözcük ya da sembol paylaşmanız yeterli. Tuba Hanım bu bilgiye dayanarak masterclass gününde kullanılacak taslak tasarımı önceden hazırlar." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Gün Programı" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "İlk 45 dk: Tasarım revizyonu ve malzeme seçimi" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "2,5 saat: Metal çalışması (kesim, şekillendirme, lehimleme)" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Son 45 dk: Yüzey işleme, parlatma ve kolye zinciri montajı" }] }] },
          ] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Bu Masterclass Kime Göre?" }] },
          { type: "paragraph", content: [{ type: "text", text: "Hiç metal deneyimi olmayanlar da katılabilir. Tuba Hanım teknik kısımları tamamlarken siz tasarım kararlarını verirsiniz. Deneyimliler ise üretimi de bizzat yapabilir. Her durumda kolye size ait ve sizi yansıtır." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Dahil Olanlar" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Kişiselleştirilmiş tasarım süreci" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Tüm malzeme (gümüş alaşım ve tercihli taş)" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Kolye kutusu ve keten torbası" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Sertifika ve tasarım dosyası" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Atölyeden profesyonel fotoğraf" }] }] },
          ] },
        ],
      },
      basePrice: 4000,
      currency: "TRY",
      defaultCapacity: 4,
      durationMinutes: 240,
      level: "all_levels",
      status: "published",
      seoTitle: "Kişisel Hikaye Kolyesi Masterclass | Tuba Atman Jewelry",
      seoDescription: "Kendi sembolünüzü gümüş kolyeye dönüştürün. Tuba Atman ile 4 saatlik kişisel masterclass. Tüm seviyelere uygun.",
    },
  });

  // ────────────────────────────────────────────
  // Program Gereksinimleri (Müfredat Adımları)
  // ────────────────────────────────────────────
  console.log("Program içerikleri ekleniyor...");

  const reqs: Array<{ id: string; programId: string; title: string; sortOrder: number }> = [
    // Temel
    { id: "req_t1_1", programId: temel.id, title: "Araç ve malzeme tanıtımı", sortOrder: 0 },
    { id: "req_t1_2", programId: temel.id, title: "Güvenlik kuralları ve atölye düzeni", sortOrder: 1 },
    { id: "req_t1_3", programId: temel.id, title: "Tel kesim, düzleştirme ve ölçme", sortOrder: 2 },
    { id: "req_t1_4", programId: temel.id, title: "Temel kıvırma ve sarma teknikleri", sortOrder: 3 },
    { id: "req_t1_5", programId: temel.id, title: "Kanca ve karabina yapımı", sortOrder: 4 },
    { id: "req_t1_6", programId: temel.id, title: "Küpe veya bileklik tamamlama", sortOrder: 5 },
    // Yüzük
    { id: "req_t2_1", programId: yuzuk.id, title: "Tasarım çizimi ve boyutlandırma", sortOrder: 0 },
    { id: "req_t2_2", programId: yuzuk.id, title: "Gümüş şerit kesim ve şekillendirme", sortOrder: 1 },
    { id: "req_t2_3", programId: yuzuk.id, title: "Lehim hazırlama ve pürmüz kullanımı", sortOrder: 2 },
    { id: "req_t2_4", programId: yuzuk.id, title: "Kaynak noktası birleştirme", sortOrder: 3 },
    { id: "req_t2_5", programId: yuzuk.id, title: "Eğeleme ve yüzük boyut ayarı", sortOrder: 4 },
    { id: "req_t2_6", programId: yuzuk.id, title: "Yüzey doku ve parlatma", sortOrder: 5 },
    // Taş Kakma
    { id: "req_t3_1", programId: takkakma.id, title: "Taş sınıflandırması ve seçim kriterleri", sortOrder: 0 },
    { id: "req_t3_2", programId: takkakma.id, title: "Kollet çerçeve hazırlama", sortOrder: 1 },
    { id: "req_t3_3", programId: takkakma.id, title: "Bezel kakma tekniği", sortOrder: 2 },
    { id: "req_t3_4", programId: takkakma.id, title: "Prong (pençe) kakma tekniği", sortOrder: 3 },
    { id: "req_t3_5", programId: takkakma.id, title: "Taş yerleştirme ve sabitleme", sortOrder: 4 },
    { id: "req_t3_6", programId: takkakma.id, title: "Son rötuş ve kontrol", sortOrder: 5 },
    // Bakır
    { id: "req_t4_1", programId: bakir.id, title: "Bakır plaka seçimi ve hazırlığı", sortOrder: 0 },
    { id: "req_t4_2", programId: bakir.id, title: "Kesim ve zımparalama", sortOrder: 1 },
    { id: "req_t4_3", programId: bakir.id, title: "Çekiçleme ve doku oluşturma", sortOrder: 2 },
    { id: "req_t4_4", programId: bakir.id, title: "Şekillendirme kalıpları ile büküm", sortOrder: 3 },
    { id: "req_t4_5", programId: bakir.id, title: "Patina ve renk işleme", sortOrder: 4 },
    { id: "req_t4_6", programId: bakir.id, title: "Cila ve son işlem", sortOrder: 5 },
    // Tel Sarma
    { id: "req_t5_1", programId: tel.id, title: "Tel numaraları ve özellikler", sortOrder: 0 },
    { id: "req_t5_2", programId: tel.id, title: "Isınma: temel sarma egzersizleri", sortOrder: 1 },
    { id: "req_t5_3", programId: tel.id, title: "Taş çevresi serbest form sarma", sortOrder: 2 },
    { id: "req_t5_4", programId: tel.id, title: "Spiral ve örgü desenleri", sortOrder: 3 },
    { id: "req_t5_5", programId: tel.id, title: "Küpe kancası ve kolye ucu bağlantısı", sortOrder: 4 },
    // Temel Sertifika
    { id: "req_s1_1", programId: sertTemel.id, title: "Metalurji ve metal özellikleri", sortOrder: 0 },
    { id: "req_s1_2", programId: sertTemel.id, title: "Kesim, bükme ve form çalışmaları", sortOrder: 1 },
    { id: "req_s1_3", programId: sertTemel.id, title: "Lehimleme teknikleri ve pürmüz güvenliği", sortOrder: 2 },
    { id: "req_s1_4", programId: sertTemel.id, title: "Yüzey işleme: doku, patina, parlatma", sortOrder: 3 },
    { id: "req_s1_5", programId: sertTemel.id, title: "Temel taş kakma: kollet ve bezel", sortOrder: 4 },
    { id: "req_s1_6", programId: sertTemel.id, title: "Bitirme projesi: özgün takı koleksiyonu (3 parça)", sortOrder: 5 },
    { id: "req_s1_7", programId: sertTemel.id, title: "Sertifika değerlendirmesi ve jüri sunumu", sortOrder: 6 },
    // İleri Sertifika
    { id: "req_s2_1", programId: sertIleri.id, title: "3D mücevher tasarım yazılımına giriş", sortOrder: 0 },
    { id: "req_s2_2", programId: sertIleri.id, title: "Kum ve ağaç döküm teknikleri", sortOrder: 1 },
    { id: "req_s2_3", programId: sertIleri.id, title: "Pırlanta ve değerli taş sınıflandırması", sortOrder: 2 },
    { id: "req_s2_4", programId: sertIleri.id, title: "Pave ve kanal kakma", sortOrder: 3 },
    { id: "req_s2_5", programId: sertIleri.id, title: "Koleksiyon geliştirme ve mood board", sortOrder: 4 },
    { id: "req_s2_6", programId: sertIleri.id, title: "Bireysel koleksiyon bitirme sergisi", sortOrder: 5 },
    // Filigran
    { id: "req_m1_1", programId: filigran.id, title: "Filigranın tarihi ve Osmanlı geleneği", sortOrder: 0 },
    { id: "req_m1_2", programId: filigran.id, title: "Tel hazırlama ve inceltme", sortOrder: 1 },
    { id: "req_m1_3", programId: filigran.id, title: "Örgü ve temel form oluşturma", sortOrder: 2 },
    { id: "req_m1_4", programId: filigran.id, title: "Lehimleme ve tutkal teknikleri", sortOrder: 3 },
    { id: "req_m1_5", programId: filigran.id, title: "Parça birleştirme ve son rötuş", sortOrder: 4 },
    // Kolye Masterclass
    { id: "req_m2_1", programId: kolye.id, title: "Kişisel sembol ve konsept geliştirme", sortOrder: 0 },
    { id: "req_m2_2", programId: kolye.id, title: "Malzeme seçimi ve tasarım onayı", sortOrder: 1 },
    { id: "req_m2_3", programId: kolye.id, title: "Metal çalışması: kesim, şekillendirme, lehimleme", sortOrder: 2 },
    { id: "req_m2_4", programId: kolye.id, title: "Yüzey işleme ve zincir montajı", sortOrder: 3 },
    { id: "req_m2_5", programId: kolye.id, title: "Fotoğraf seansı ve sertifika töreni", sortOrder: 4 },
  ];

  for (const req of reqs) {
    await db.programRequirement.create({ data: req });
  }

  // ────────────────────────────────────────────
  // SSS (FAQ)
  // ────────────────────────────────────────────
  console.log("SSS ekleniyor...");

  const faqs = [
    { id: "faq_t1_1", programId: temel.id, question: "Hiç deneyimim yok, yine de katılabilir miyim?", answer: "Evet! Bu atölye tamamen sıfırdan başlamak isteyenler için tasarlandı. Hiçbir ön bilgiye ihtiyaç yoktur.", sortOrder: 0 },
    { id: "faq_t1_2", programId: temel.id, question: "Malzemeleri kendim getirmem gerekiyor mu?", answer: "Hayır, tüm malzeme ve araçlar tarafımızca karşılanmaktadır. Rahat giysilerle gelmeniz yeterli.", sortOrder: 1 },
    { id: "faq_t1_3", programId: temel.id, question: "Yapılan takıları eve götürebilir miyim?", answer: "Evet, atölye boyunca tamamladığınız tüm parçalar sizindir.", sortOrder: 2 },
    { id: "faq_t1_4", programId: temel.id, question: "Kaç kişilik gruplarla çalışıyorsunuz?", answer: "Maksimum 8 kişilik küçük gruplarla çalışıyoruz. Bu sayede her katılımcıya yeterli ilgi gösterebildiğimizden emin oluyoruz.", sortOrder: 3 },

    { id: "faq_t2_1", programId: yuzuk.id, question: "Gümüş fiyatına göre ücret değişiyor mu?", answer: "Hayır, fiyat sabittir ve kullanılan standart miktardaki gümüşü kapsamaktadır.", sortOrder: 0 },
    { id: "faq_t2_2", programId: yuzuk.id, question: "Yüzüğüm bitmezse ne olur?", answer: "Nadiren yaşanır ama bitmesi durumunda bir sonraki seansa ücretsiz katılım imkanı sunuyoruz.", sortOrder: 1 },
    { id: "faq_t2_3", programId: yuzuk.id, question: "Kendi tasarımımı getirebilir miyim?", answer: "Genel hatlarıyla evet. Ancak tasarımın seansın zaman dilimine uygun olması için önceden iletişime geçmenizi öneririz.", sortOrder: 2 },
    { id: "faq_t2_4", programId: yuzuk.id, question: "Pürmüz kullanmak tehlikeli değil mi?", answer: "Tüm katılımcılara başlangıçta güvenlik brifing verilmektedir. Atölye boyunca eğitmenler yanınızda oluyor.", sortOrder: 3 },

    { id: "faq_t3_1", programId: takkakma.id, question: "Hangi taşlarla çalışacağız?", answer: "Ametist, pembe kuvars, turkuaz ve labradorit arasından seçim yapabilirsiniz. Tüm taşlar dahildir.", sortOrder: 0 },
    { id: "faq_t3_2", programId: takkakma.id, question: "Lehimleme bilgisi şart mı?", answer: "Önerilir. Gümüş Yüzük Atölyesi veya benzeri bir metal deneyimi olan katılımcılar için daha verimli geçer.", sortOrder: 1 },
    { id: "faq_t3_3", programId: takkakma.id, question: "Kakma yaptığım takıyı götürebilir miyim?", answer: "Evet, tamamladığınız parça sizindir. Kolye ucu veya yüzük olarak bitmiş şekilde alırsınız.", sortOrder: 2 },

    { id: "faq_s1_1", programId: sertTemel.id, question: "Sertifika programına yarı yolda başlayabilir miyim?", answer: "Hayır, program modüler yapısı nedeniyle baştan katılım zorunludur.", sortOrder: 0 },
    { id: "faq_s1_2", programId: sertTemel.id, question: "Sertifika uluslararası geçerli mi?", answer: "Evet, verilen sertifika Avrupa Kuyumcular Birliği (EJA) standartlarına uygundur.", sortOrder: 1 },
    { id: "faq_s1_3", programId: sertTemel.id, question: "Seansları kaçırırsam ne olur?", answer: "2 seansa kadar telafi dersi hakkı tanınmaktadır. Daha fazla devamsızlık durumunda program ileriki dönemden tekrar alınmalıdır.", sortOrder: 2 },
    { id: "faq_s1_4", programId: sertTemel.id, question: "Programı bitirince kendi atölyemi açabilir miyim?", answer: "Kesinlikle evet. Pek çok mezunumuz kendi küçük takı markasını kurdu.", sortOrder: 3 },

    { id: "faq_m1_1", programId: filigran.id, question: "Filigran için önceden deneyim şart mı?", answer: "Önerilir ama zorunlu değildir. Sabırlı ve ince el becerisi olan herkes öğrenebilir.", sortOrder: 0 },
    { id: "faq_m1_2", programId: filigran.id, question: "Gün boyunca başka bir aktivite var mı?", answer: "Öğle arası dahil günün tamamını atölyede geçireceksiniz. Öğle yemeği ve tüm ikramlar dahildir.", sortOrder: 1 },
    { id: "faq_m1_3", programId: filigran.id, question: "Tamamlanan filigran parçasına ne olur?", answer: "Kendi elinizle tamamladığınız parça sizindir. Bitirme durumuna göre kolye ucu ya da küpe formunda çıkacaktır.", sortOrder: 2 },

    { id: "faq_m2_1", programId: kolye.id, question: "Tasarım fikrimi nasıl ileteyim?", answer: "Kayıt sonrasında tarafınıza bir form gönderilecektir. Bu formda sembol, anlam veya referans görseli paylaşabilirsiniz.", sortOrder: 0 },
    { id: "faq_m2_2", programId: kolye.id, question: "Kolye mutlaka gümüşten mi olacak?", answer: "Standart alaşım gümüştür. Altın veya rose gold kaplama için ek ücret talep edilebilir.", sortOrder: 1 },
    { id: "faq_m2_3", programId: kolye.id, question: "Hediye olarak alınabilir mi?", answer: "Kesinlikle evet. Hediye olduğunu belirtirseniz pakete el yazısı kart ekliyoruz.", sortOrder: 2 },
  ];

  for (const faq of faqs) {
    await db.programFaq.create({ data: faq });
  }

  // ────────────────────────────────────────────
  // Oturumlar (Ağustos – Kasım 2026)
  // ────────────────────────────────────────────
  console.log("Oturumlar ekleniyor...");

  const LOC = "Tuba Atman Jewelry Atölyesi";
  const ADDR = "Moda Caddesi No:42, Kadıköy, İstanbul";

  const sessions = [
    // Temel Takı — her iki haftada bir Cumartesi 10:00–12:00 (UTC: 07:00–09:00)
    { id: "ses_t1_01", programId: temel.id, startAt: new Date("2026-08-08T07:00:00Z"), endAt: new Date("2026-08-08T09:00:00Z") },
    { id: "ses_t1_02", programId: temel.id, startAt: new Date("2026-08-22T07:00:00Z"), endAt: new Date("2026-08-22T09:00:00Z") },
    { id: "ses_t1_03", programId: temel.id, startAt: new Date("2026-09-05T07:00:00Z"), endAt: new Date("2026-09-05T09:00:00Z") },
    { id: "ses_t1_04", programId: temel.id, startAt: new Date("2026-09-19T07:00:00Z"), endAt: new Date("2026-09-19T09:00:00Z") },
    { id: "ses_t1_05", programId: temel.id, startAt: new Date("2026-10-03T07:00:00Z"), endAt: new Date("2026-10-03T09:00:00Z") },
    { id: "ses_t1_06", programId: temel.id, startAt: new Date("2026-10-17T07:00:00Z"), endAt: new Date("2026-10-17T09:00:00Z") },
    { id: "ses_t1_07", programId: temel.id, startAt: new Date("2026-11-07T07:00:00Z"), endAt: new Date("2026-11-07T09:00:00Z") },

    // Gümüş Yüzük — Pazar 14:00–17:00
    { id: "ses_t2_01", programId: yuzuk.id, startAt: new Date("2026-08-16T11:00:00Z"), endAt: new Date("2026-08-16T14:00:00Z") },
    { id: "ses_t2_02", programId: yuzuk.id, startAt: new Date("2026-09-13T11:00:00Z"), endAt: new Date("2026-09-13T14:00:00Z") },
    { id: "ses_t2_03", programId: yuzuk.id, startAt: new Date("2026-10-11T11:00:00Z"), endAt: new Date("2026-10-11T14:00:00Z") },
    { id: "ses_t2_04", programId: yuzuk.id, startAt: new Date("2026-11-08T11:00:00Z"), endAt: new Date("2026-11-08T14:00:00Z") },

    // Taş Kakma — Cumartesi 14:00–17:00
    { id: "ses_t3_01", programId: takkakma.id, startAt: new Date("2026-09-06T11:00:00Z"), endAt: new Date("2026-09-06T14:00:00Z") },
    { id: "ses_t3_02", programId: takkakma.id, startAt: new Date("2026-10-10T11:00:00Z"), endAt: new Date("2026-10-10T14:00:00Z") },
    { id: "ses_t3_03", programId: takkakma.id, startAt: new Date("2026-11-14T11:00:00Z"), endAt: new Date("2026-11-14T14:00:00Z") },

    // Bakır Dövme — Cuma 17:30–20:00
    { id: "ses_t4_01", programId: bakir.id, startAt: new Date("2026-08-07T14:30:00Z"), endAt: new Date("2026-08-07T17:00:00Z") },
    { id: "ses_t4_02", programId: bakir.id, startAt: new Date("2026-08-28T14:30:00Z"), endAt: new Date("2026-08-28T17:00:00Z") },
    { id: "ses_t4_03", programId: bakir.id, startAt: new Date("2026-09-25T14:30:00Z"), endAt: new Date("2026-09-25T17:00:00Z") },
    { id: "ses_t4_04", programId: bakir.id, startAt: new Date("2026-10-23T14:30:00Z"), endAt: new Date("2026-10-23T17:00:00Z") },
    { id: "ses_t4_05", programId: bakir.id, startAt: new Date("2026-11-20T14:30:00Z"), endAt: new Date("2026-11-20T17:00:00Z") },

    // Tel Sarma — Pazar 10:00–12:30
    { id: "ses_t5_01", programId: tel.id, startAt: new Date("2026-08-23T07:00:00Z"), endAt: new Date("2026-08-23T09:30:00Z") },
    { id: "ses_t5_02", programId: tel.id, startAt: new Date("2026-09-27T07:00:00Z"), endAt: new Date("2026-09-27T09:30:00Z") },
    { id: "ses_t5_03", programId: tel.id, startAt: new Date("2026-10-25T07:00:00Z"), endAt: new Date("2026-10-25T09:30:00Z") },
    { id: "ses_t5_04", programId: tel.id, startAt: new Date("2026-11-22T07:00:00Z"), endAt: new Date("2026-11-22T09:30:00Z") },

    // Temel Sertifika — Salı & Perşembe 18:30–21:30
    { id: "ses_s1_01", programId: sertTemel.id, startAt: new Date("2026-08-18T15:30:00Z"), endAt: new Date("2026-08-18T18:30:00Z"), notes: "Seans 1/16 — Başlangıç dersi" },
    { id: "ses_s1_02", programId: sertTemel.id, startAt: new Date("2026-08-20T15:30:00Z"), endAt: new Date("2026-08-20T18:30:00Z"), notes: "Seans 2/16" },
    { id: "ses_s1_03", programId: sertTemel.id, startAt: new Date("2026-08-25T15:30:00Z"), endAt: new Date("2026-08-25T18:30:00Z"), notes: "Seans 3/16" },
    { id: "ses_s1_04", programId: sertTemel.id, startAt: new Date("2026-08-27T15:30:00Z"), endAt: new Date("2026-08-27T18:30:00Z"), notes: "Seans 4/16" },
    { id: "ses_s1_05", programId: sertTemel.id, startAt: new Date("2026-09-01T15:30:00Z"), endAt: new Date("2026-09-01T18:30:00Z"), notes: "Seans 5/16" },
    { id: "ses_s1_06", programId: sertTemel.id, startAt: new Date("2026-09-03T15:30:00Z"), endAt: new Date("2026-09-03T18:30:00Z"), notes: "Seans 6/16" },
    { id: "ses_s1_07", programId: sertTemel.id, startAt: new Date("2026-09-08T15:30:00Z"), endAt: new Date("2026-09-08T18:30:00Z"), notes: "Seans 7/16" },
    { id: "ses_s1_08", programId: sertTemel.id, startAt: new Date("2026-09-10T15:30:00Z"), endAt: new Date("2026-09-10T18:30:00Z"), notes: "Seans 8/16" },
    { id: "ses_s1_09", programId: sertTemel.id, startAt: new Date("2026-09-15T15:30:00Z"), endAt: new Date("2026-09-15T18:30:00Z"), notes: "Seans 9/16" },
    { id: "ses_s1_10", programId: sertTemel.id, startAt: new Date("2026-09-17T15:30:00Z"), endAt: new Date("2026-09-17T18:30:00Z"), notes: "Seans 10/16" },
    { id: "ses_s1_11", programId: sertTemel.id, startAt: new Date("2026-09-22T15:30:00Z"), endAt: new Date("2026-09-22T18:30:00Z"), notes: "Seans 11/16" },
    { id: "ses_s1_12", programId: sertTemel.id, startAt: new Date("2026-09-24T15:30:00Z"), endAt: new Date("2026-09-24T18:30:00Z"), notes: "Seans 12/16" },
    { id: "ses_s1_13", programId: sertTemel.id, startAt: new Date("2026-09-29T15:30:00Z"), endAt: new Date("2026-09-29T18:30:00Z"), notes: "Seans 13/16" },
    { id: "ses_s1_14", programId: sertTemel.id, startAt: new Date("2026-10-01T15:30:00Z"), endAt: new Date("2026-10-01T18:30:00Z"), notes: "Seans 14/16" },
    { id: "ses_s1_15", programId: sertTemel.id, startAt: new Date("2026-10-06T15:30:00Z"), endAt: new Date("2026-10-06T18:30:00Z"), notes: "Seans 15/16" },
    { id: "ses_s1_16", programId: sertTemel.id, startAt: new Date("2026-10-08T15:30:00Z"), endAt: new Date("2026-10-08T18:30:00Z"), notes: "Seans 16/16 — Bitirme projesi" },

    // İleri Sertifika — Salı & Cuma 18:00–21:30
    { id: "ses_s2_01", programId: sertIleri.id, startAt: new Date("2026-09-15T15:00:00Z"), endAt: new Date("2026-09-15T18:30:00Z"), notes: "Seans 1/24 — Başlangıç" },
    { id: "ses_s2_02", programId: sertIleri.id, startAt: new Date("2026-09-18T15:00:00Z"), endAt: new Date("2026-09-18T18:30:00Z"), notes: "Seans 2/24" },
    { id: "ses_s2_03", programId: sertIleri.id, startAt: new Date("2026-09-22T15:00:00Z"), endAt: new Date("2026-09-22T18:30:00Z"), notes: "Seans 3/24" },
    { id: "ses_s2_04", programId: sertIleri.id, startAt: new Date("2026-09-25T15:00:00Z"), endAt: new Date("2026-09-25T18:30:00Z"), notes: "Seans 4/24" },
    { id: "ses_s2_05", programId: sertIleri.id, startAt: new Date("2026-09-29T15:00:00Z"), endAt: new Date("2026-09-29T18:30:00Z"), notes: "Seans 5/24" },
    { id: "ses_s2_06", programId: sertIleri.id, startAt: new Date("2026-10-02T15:00:00Z"), endAt: new Date("2026-10-02T18:30:00Z"), notes: "Seans 6/24" },

    // Filigran Masterclass — Cumartesi tam gün
    { id: "ses_m1_01", programId: filigran.id, startAt: new Date("2026-08-29T06:00:00Z"), endAt: new Date("2026-08-29T11:00:00Z"), notes: "Öğle yemeği dahil" },
    { id: "ses_m1_02", programId: filigran.id, startAt: new Date("2026-10-10T06:00:00Z"), endAt: new Date("2026-10-10T11:00:00Z"), notes: "Öğle yemeği dahil" },
    { id: "ses_m1_03", programId: filigran.id, startAt: new Date("2026-11-21T06:00:00Z"), endAt: new Date("2026-11-21T11:00:00Z"), notes: "Öğle yemeği dahil" },

    // Kolye Masterclass — Pazar
    { id: "ses_m2_01", programId: kolye.id, startAt: new Date("2026-09-06T07:00:00Z"), endAt: new Date("2026-09-06T11:00:00Z"), notes: "Kisisellestirilmis program — 1 hafta onceden iletisim gerekli" },
    { id: "ses_m2_02", programId: kolye.id, startAt: new Date("2026-10-04T07:00:00Z"), endAt: new Date("2026-10-04T11:00:00Z"), notes: "Kisisellestirilmis program — 1 hafta onceden iletisim gerekli" },
    { id: "ses_m2_03", programId: kolye.id, startAt: new Date("2026-11-01T07:00:00Z"), endAt: new Date("2026-11-01T11:00:00Z"), notes: "Kisisellestirilmis program — 1 hafta onceden iletisim gerekli" },
  ];

  const capacityMap: Record<string, number> = {
    prog_atolye_temel: 8,
    prog_atolye_yuzuk: 6,
    prog_atolye_takkakma: 5,
    prog_atolye_bakir: 8,
    prog_atolye_tel: 8,
    prog_sertifika_temel: 5,
    prog_sertifika_ileri: 4,
    prog_master_filigran: 4,
    prog_master_kolye: 4,
  };

  for (const s of sessions) {
    await db.workshopSession.create({
      data: {
        id: s.id,
        programId: s.programId,
        startAt: s.startAt,
        endAt: s.endAt,
        timezone: "Europe/Istanbul",
        capacity: capacityMap[s.programId] ?? 8,
        status: "published",
        locationName: LOC,
        locationAddress: ADDR,
        notes: (s as { notes?: string }).notes ?? null,
      },
    });
  }

  console.log("Tamamlandi! 7 program, 51 oturum, tum gereksinimler ve SSS eklendi.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
