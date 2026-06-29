# Takı Atölyesi Web Platformu
## Proje Bağlamı, Mimari Gereksinimler ve Yapay Zeka Geliştirme Yönergeleri

> Bu belge; butik, üst segment bir takı atölyesi için geliştirilecek full-stack web platformunun ürün kapsamını, mimari kararlarını, tasarım standardını ve yapay zeka destekli geliştirme kurallarını tanımlar.  
> Projede çalışan yapay zeka asistanı, kod üretmeden önce bu belgedeki tüm kuralları dikkate almalıdır.

---

## 1. Proje Vizyonu

Bu proje, butik bir takı atölyesinin dijital vitrini ve operasyon merkezi olarak çalışacak full-stack bir web uygulamasıdır.

Müşteriler;

- Takı yapım atölyelerini ve sertifika programlarını inceleyebilmeli,
- Uygun tarih ve saatlerdeki oturumları görebilmeli,
- Kontenjan durumunu takip edebilmeli,
- Güvenli biçimde rezervasyon oluşturabilmeli,
- Gerekli durumlarda ödeme adımına geçebilmeli,
- Kendi rezervasyon geçmişini görüntüleyebilmelidir.

Atölye ekibi ise admin paneli üzerinden;

- Atölye, sertifika ve oturumları yönetebilmeli,
- Kontenjanları ve rezervasyonları takip edebilmeli,
- Görsel ve metin içeriklerini güncelleyebilmeli,
- Ödeme ve rezervasyon durumlarını kontrol edebilmeli,
- Site üzerindeki **tüm dinamik verileri** yönetebilmelidir.

### Ana Hedef

Platform yalnızca işlevsel bir rezervasyon sitesi değil; dijitalde üst segment, rafine ve kişisel bir takı atölyesi deneyimi sunmalıdır.

---

## 2. Temel Ürün İlkeleri

1. **Tam dinamik içerik:** Frontend tarafında üretim için sabit içerik, fiyat, atölye bilgisi, tarih, kapasite veya görsel bırakılmamalıdır.
2. **Backend kaynaklı gerçeklik:** Fiyat, kontenjan, yetki, rezervasyon ve ödeme durumu yalnızca backend tarafından doğrulanmalıdır.
3. **Tasarım önceliği:** Arayüz, sıradan bir kurs platformu veya jenerik SaaS paneli gibi görünmemelidir.
4. **Ölçeklenebilirlik:** Yeni atölye türleri, kampanyalar, eğitmenler, ödeme sağlayıcıları ve bildirim kanalları sonradan eklenebilir olmalıdır.
5. **Güvenlik ve doğrulama:** Kritik işlemlerde frontend kontrolü yeterli kabul edilmemeli; yetkilendirme ve doğrulama backend tarafında uygulanmalıdır.
6. **Mobil öncelik:** Müşteri deneyimi mobil cihazlarda kusursuz olmalı; admin paneli ise masaüstü odaklı ama responsive olmalıdır.

---

## 3. Kullanıcı Tipleri ve Roller

Sistem rol tabanlı yetkilendirme (RBAC) mantığıyla çalışmalıdır.

| Rol | Yetkiler |
|---|---|
| `guest` | Siteyi, atölyeleri, sertifikaları ve uygun oturumları görüntüleyebilir. |
| `customer` | Hesap oluşturabilir, rezervasyon yapabilir, kendi rezervasyonlarını ve profilini yönetebilir. |
| `instructor` | Kendisine atanmış oturumları ve katılımcı listelerini görüntüleyebilir. |
| `editor` | İçerik, görsel, metin ve sayfa düzenlerini yönetebilir; finansal veya kullanıcı yetkisi işlemleri yapamaz. |
| `admin` | Tüm içerik, kullanıcı, rezervasyon, oturum, ödeme ve ayarları yönetebilir. |

### Yetkilendirme Kuralları

- Admin paneli yalnızca yetkili kullanıcılar tarafından erişilebilir olmalıdır.
- Her API endpoint’i backend tarafında rol kontrolü yapmalıdır.
- Frontend’de bir butonu gizlemek, güvenlik önlemi olarak kabul edilmemelidir.
- Kritik işlemler audit log kaydı oluşturmalıdır.
- Kullanıcı yalnızca kendi rezervasyonlarına ve kendi profil verilerine erişebilmelidir.

---

## 4. Ana Modüller

### 4.1 Müşteri Vitrini

Müşteri tarafında aşağıdaki sayfalar veya eşdeğer akışlar bulunmalıdır:

- Ana sayfa
- Atölye listesi
- Atölye detay sayfası
- Sertifika programları listesi
- Sertifika detay sayfası
- Takvim / uygun oturum seçimi
- Rezervasyon akışı
- Rezervasyon başarı ve hata ekranları
- Hakkımızda
- Sık sorulan sorular
- İletişim
- Kullanıcı hesabı ve rezervasyon geçmişi
- Gizlilik, mesafeli satış / iptal-iade ve benzeri yasal metin sayfaları

### 4.2 Admin Paneli

Admin paneli aşağıdaki alanları kapsamalıdır:

- Yönetim özeti / dashboard
- Atölye yönetimi
- Sertifika programı yönetimi
- Oturum ve takvim yönetimi
- Rezervasyon yönetimi
- Müşteri yönetimi
- Ödeme ve iade durumları
- Medya kütüphanesi
- Site içerik yönetimi
- Eğitmen yönetimi
- Kupon / kampanya yönetimi için genişletilebilir alan
- Kullanıcı rolleri ve yetkiler
- Audit log / işlem geçmişi
- Site ayarları

---

## 5. Veri Modeli

Veritabanı ilişkisel bir yapıda tasarlanmalıdır. İsimler teknolojiye göre değişebilir; ancak alanların amacı ve ilişkileri korunmalıdır.

### 5.1 `Users`

Kullanıcı hesaplarını tutar.

```ts
User {
  id: string
  name: string
  email: string
  phone?: string
  passwordHash?: string
  role: 'customer' | 'instructor' | 'editor' | 'admin'
  isActive: boolean
  createdAt: datetime
  updatedAt: datetime
}
```

### 5.2 `Programs`

Atölye ve sertifika programlarını ortak bir yapı altında tutar.

> Tercih edilen yaklaşım: `Workshops` ve `Certificates` için tamamen ayrı ve tekrar eden model yapıları yerine, ortak bir `Programs` modeli kullanılmalıdır. Program türü `type` alanıyla ayrıştırılır. Böylece `Sessions`, `Reservations`, SEO alanları ve medya ilişkileri daha sade tutulur.

```ts
Program {
  id: string
  type: 'workshop' | 'certificate'
  title: string
  slug: string
  shortDescription: string
  description: richText
  coverImageId?: string
  galleryImageIds: string[]
  basePrice: decimal
  currency: string
  defaultCapacity?: number
  durationMinutes?: number
  level?: 'beginner' | 'intermediate' | 'advanced' | 'all_levels'
  status: 'draft' | 'published' | 'archived'
  seoTitle?: string
  seoDescription?: string
  createdAt: datetime
  updatedAt: datetime
}
```

### 5.3 `ProgramRequirements`

Özellikle sertifika programları için şart, içerik, modül ve katılım bilgilerini tutar.

```ts
ProgramRequirement {
  id: string
  programId: string
  title: string
  description?: richText
  sortOrder: number
}
```

### 5.4 `Sessions`

Her programın rezervasyon yapılabilir tarih ve saatlerini temsil eder.

```ts
Session {
  id: string
  programId: string
  instructorId?: string
  startAt: datetime
  endAt: datetime
  timezone: 'Europe/Istanbul'
  capacity: number
  priceOverride?: decimal
  status: 'draft' | 'published' | 'full' | 'cancelled' | 'completed'
  locationName?: string
  locationAddress?: string
  notes?: string
  createdAt: datetime
  updatedAt: datetime
}
```

### 5.5 `Reservations`

Rezervasyon ve müşteri iletişim bilgilerini tutar.

```ts
Reservation {
  id: string
  userId?: string
  sessionId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  participantCount: number
  priceSnapshot: decimal
  currency: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'waitlisted' | 'no_show' | 'completed'
  paymentStatus: 'not_required' | 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
  paymentReference?: string
  couponCode?: string
  discountAmount?: decimal
  notes?: string
  cancelledAt?: datetime
  cancellationReason?: string
  createdAt: datetime
  updatedAt: datetime
}
```

### 5.6 `Payments`

Ödeme sağlayıcısından gelen işlemleri ve iade kayıtlarını saklar.

```ts
Payment {
  id: string
  reservationId: string
  provider: string
  providerPaymentId?: string
  amount: decimal
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
  paidAt?: datetime
  failureReason?: string
  rawProviderData?: json
  createdAt: datetime
  updatedAt: datetime
}
```

### 5.7 `Media`

Tüm görsel ve medya içeriklerini yönetir.

```ts
Media {
  id: string
  fileName: string
  url: string
  altText?: string
  width?: number
  height?: number
  mimeType: string
  sizeBytes?: number
  focalPointX?: number
  focalPointY?: number
  createdAt: datetime
}
```

### 5.8 `SiteContent`

Sitedeki yönetilebilir sabit sayfa içeriklerini ve ayarları tutar.

```ts
SiteContent {
  id: string
  key: string
  locale: string
  value: json
  status: 'draft' | 'published'
  updatedBy?: string
  updatedAt: datetime
}
```

Örnek `key` değerleri:

- `home.hero`
- `home.featuredPrograms`
- `about.content`
- `contact.details`
- `faq.items`
- `footer.socialLinks`
- `legal.privacyPolicy`
- `legal.cancellationPolicy`

### 5.9 `AuditLogs`

Kritik admin işlemlerini kaydeder.

```ts
AuditLog {
  id: string
  actorUserId?: string
  action: string
  entityType: string
  entityId?: string
  oldValue?: json
  newValue?: json
  createdAt: datetime
}
```

---

## 6. Rezervasyon ve Kontenjan İş Kuralları

### Rezervasyon Durumları

| Durum | Açıklama |
|---|---|
| `pending` | Rezervasyon oluşturuldu; ödeme veya admin onayı bekleniyor. |
| `confirmed` | Rezervasyon ve gerekli ödeme/onay tamamlandı. |
| `cancelled` | Kullanıcı veya admin tarafından iptal edildi. |
| `refunded` | Ücret iade edildi. |
| `waitlisted` | Kontenjan dolu olduğu için kullanıcı bekleme listesine alındı. |
| `no_show` | Kullanıcı oturuma katılmadı. |
| `completed` | Oturum veya program başarıyla tamamlandı. |

### Oturum Durumları

| Durum | Açıklama |
|---|---|
| `draft` | Admin tarafından hazırlanmış fakat kullanıcıya açılmamış oturum. |
| `published` | Kullanıcıların görüntüleyip rezervasyon yapabildiği oturum. |
| `full` | Kontenjanı dolu oturum. |
| `cancelled` | İptal edilmiş oturum. |
| `completed` | Tarihi geçmiş ve tamamlanmış oturum. |

### Zorunlu Kurallar

- Kontenjan yalnızca backend tarafından hesaplanmalıdır.
- Aynı son kontenjana iki kişinin eş zamanlı rezervasyon yapmasını önlemek için rezervasyon işlemi veritabanı transaction mekanizmasıyla yürütülmelidir.
- Kullanıcı aynı oturuma birden fazla aktif rezervasyon oluşturamamalıdır.
- Rezervasyon oluşturulduğunda program veya oturum fiyatı `priceSnapshot` alanına yazılmalıdır.
- Program fiyatı sonradan değişse bile eski rezervasyonların fiyatı değişmemelidir.
- `pending` rezervasyonları için ödeme bekleme süresi tanımlanabilir olmalıdır. Süre aşılırsa rezervasyon otomatik iptal edilebilmeli ve kontenjan geri açılmalıdır.
- Bir oturum iptal edildiğinde etkilenen müşteriler için bildirim süreci tetiklenebilmelidir.
- Oturum tarihleri sistemde UTC veya timezone bilgisiyle güvenli biçimde saklanmalı; arayüzde `Europe/Istanbul` saat diliminde gösterilmelidir.

---

## 7. Ödeme, İade ve Bildirimler

### Ödeme Mimarisi

- Ödeme sağlayıcısı uygulama kodundan soyutlanmalıdır.
- Sağlayıcı değiştiğinde rezervasyon iş mantığı yeniden yazılmamalıdır.
- Ödeme sonucu frontend yönlendirmesine güvenilerek doğrulanmamalı; backend webhook veya sağlayıcı API doğrulaması kullanılmalıdır.
- Başarılı ödeme sonrasında rezervasyon durumu güvenli biçimde `confirmed` durumuna geçmelidir.
- Başarısız ödeme sonrası kullanıcıya anlaşılır hata mesajı gösterilmelidir.

### Bildirimler

Aşağıdaki olaylar için e-posta bildirimi altyapısı hazırlanmalıdır:

- Rezervasyon oluşturuldu
- Ödeme başarıyla tamamlandı
- Rezervasyon onaylandı
- Rezervasyon iptal edildi
- Oturum iptal edildi veya saati değişti
- Oturuma yaklaşırken hatırlatma zamanı geldi
- Bekleme listesindeki kullanıcıya yer açıldı

Bildirim şablonları da admin panelinden yönetilebilir olacak şekilde tasarlanmalıdır.

---

## 8. API Tasarım Kuralları

### Genel İlkeler

- API endpoint’leri versiyonlanmalıdır: `/api/v1/...`
- Kritik iş mantığı frontend tarafında uygulanmamalıdır.
- Tüm inputlar backend’de doğrulanmalıdır.
- Hata mesajları kullanıcı dostu; log kayıtları geliştirici dostu olmalıdır.
- Sayfalama, filtreleme, sıralama ve tarih aralığı sorguları admin listelerinde desteklenmelidir.
- Mutasyon isteklerinde, gerekli yerlerde idempotency yaklaşımı değerlendirilmelidir.

### Örnek Cevap Formatı

```json
{
  "success": true,
  "message": "Reservation created successfully.",
  "data": {},
  "errors": []
}
```

### Örnek Endpoint Grupları

```txt
GET    /api/v1/programs
GET    /api/v1/programs/:slug
GET    /api/v1/sessions
POST   /api/v1/reservations
GET    /api/v1/me/reservations
POST   /api/v1/payments/create
POST   /api/v1/payments/webhook

GET    /api/v1/admin/reservations
PATCH  /api/v1/admin/reservations/:id
CRUD   /api/v1/admin/programs
CRUD   /api/v1/admin/sessions
CRUD   /api/v1/admin/content
CRUD   /api/v1/admin/media
```

---

## 9. Admin Paneli Gereksinimleri

Admin paneli temiz, hızlı ve operasyon odaklı olmalıdır. Görsel dil müşteri vitriniyle aynı markaya ait hissettirmeli; ancak kullanılabilirlik estetik uğruna zayıflamamalıdır.

### Zorunlu Ekranlar

- Dashboard: günlük / haftalık / aylık rezervasyon özeti
- Takvim görünümü: gün, hafta ve ay bazlı oturum yönetimi
- Atölye ve sertifika oluşturma / güncelleme ekranları
- Oturum oluşturma, kopyalama, kapasite değiştirme ve iptal işlemleri
- Rezervasyon listesi ve detay ekranı
- Müşteri profili ve rezervasyon geçmişi
- Ödeme durumu ve iade takibi
- Medya kütüphanesi
- Site içerik yönetimi
- Kullanıcı rolleri ve yetkiler
- Audit log ekranı

### Listeleme Özellikleri

Rezervasyon listesinde en az aşağıdaki filtreler bulunmalıdır:

- Tarih aralığı
- Program
- Oturum
- Rezervasyon durumu
- Ödeme durumu
- Müşteri adı, e-posta veya telefon numarası
- Eğitmen

### Kullanılabilirlik Kuralları

- Silme işlemlerinde onay penceresi bulunmalıdır.
- Mümkünse soft delete veya geri alma altyapısı kullanılmalıdır.
- Formlarda autosave yerine açık taslak / yayınlama modeli tercih edilmelidir.
- Boş durum, yükleniyor durumları ve hata durumları özel olarak tasarlanmalıdır.
- CSV veya Excel dışa aktarma desteği bulunmalıdır.

---

## 10. Medya ve İçerik Yönetimi

- Tüm görseller admin panelinden yüklenebilir, seçilebilir, yeniden sıralanabilir ve silinebilir olmalıdır.
- Görseller frontend koduna sabit olarak gömülmemelidir.
- Her görsel için `altText` alanı bulunmalıdır.
- Hero alanı, program kapakları, galeri, hakkımızda görselleri ve sosyal medya görselleri dinamik olmalıdır.
- Görseller otomatik optimize edilmeli; uygun boyutlarda küçük önizlemeler üretilmelidir.
- Modern formatlar tercih edilmelidir: WebP veya AVIF.
- Silinmek istenen medya aktif içerikte kullanılıyorsa admin uyarılmalıdır.
- İçeriklerde taslak ve yayınlanmış versiyon ayrımı desteklenmelidir.

---

## 11. Tasarım ve UI/UX Felsefesi

Bu projenin en kritik noktası estetik kalitedir.

### Hedef Duygu

Arayüz şu duyguları vermelidir:

- Rafine
- Sessiz ama güçlü
- El işçiliğine saygılı
- Çağdaş
- Zarif
- Kişisel
- Güvenilir

### Kesinlikle Kaçınılacaklar

- Varsayılan Bootstrap görünümü
- Parlak mavi birincil butonlar
- Gereksiz büyük border-radius değerleri
- Her kartta kullanılan ağır gölgeler
- Fazla gradient
- Aşırı ikon kullanımı
- Jenerik SaaS dashboard estetiği
- Tekrarlayan yuvarlak kartlar ve şablon hissi
- Sadece “lüks” görünmesi için anlamsız altın renk kullanımı

### Görsel İlkeler

- Tipografi hiyerarşisi güçlü olmalıdır.
- Geniş boşluklar cesur biçimde kullanılmalıdır.
- Renk paleti monokrom, sıcak nötr, toprak veya kontrollü pastel tonlarda kurulmalıdır.
- Kontrast, renk kalabalığıyla değil; ölçü, boşluk, tipografi ve yüzey farklarıyla yaratılmalıdır.
- İnce çizgiler, zarif ayırıcılar ve dikkatli hizalama tercih edilmelidir.
- Mikro animasyonlar yalnızca etkileşimi açıklamak veya geçişi yumuşatmak için kullanılmalıdır.
- Tasarım her ekranda “butik takı markası” kimliğini korumalıdır.

### Tasarım Sistemi

- Renkler, boşluklar, tipografi, border, gölge ve animasyon değerleri tasarım token’ları olarak tanımlanmalıdır.
- Aynı değerler rastgele tekrar yazılmamalı; merkezi token sistemi kullanılmalıdır.
- Her bileşen için en az şu durumlar düşünülmelidir: `default`, `hover`, `focus`, `active`, `disabled`, `loading`, `error`.
- Buton, input, modal, toast, tablo, filtre, takvim ve kartlar ortak bileşen sistemi üzerinden üretilmelidir.

---

## 12. SEO, Performans ve Erişilebilirlik

### SEO

- Her sayfanın dinamik başlığı, açıklaması ve Open Graph verisi olmalıdır.
- Program detay sayfaları SEO dostu `slug` yapısı kullanmalıdır.
- Sitemap ve robots.txt üretilmelidir.
- Uygun sayfalarda yapılandırılmış veri kullanılmalıdır: `Organization`, `LocalBusiness`, `Event`, `Course`.
- Sayfa içerikleri mümkün olduğunca server-rendered veya statik üretime uygun kurgulanmalıdır.

### Performans

- Hero görseli öncelikli; diğer görseller lazy-load edilmelidir.
- Gereksiz JavaScript yükü azaltılmalıdır.
- Ağır animasyonlardan kaçınılmalıdır.
- Görseller boyutlandırılmış, optimize edilmiş ve responsive sunulmalıdır.
- Admin paneli ile müşteri vitrini kendi performans ihtiyaçlarına göre optimize edilmelidir.

### Erişilebilirlik

- Renk kontrastı yeterli olmalıdır.
- Temel akışlar klavye ile kullanılabilir olmalıdır.
- Form alanlarında açık label, açıklayıcı hata metni ve doğru odak yönetimi bulunmalıdır.
- Görseller anlamlı alt metinlerle sunulmalıdır.
- `prefers-reduced-motion` tercihi desteklenmelidir.
- Modal, dropdown ve takvim gibi bileşenlerde odak tuzağı ve ekran okuyucu davranışı düşünülmelidir.

---

## 13. Güvenlik, Veri Koruma ve Operasyon

- Şifreler güvenli hash yöntemiyle saklanmalıdır.
- Gizli anahtarlar ve ödeme bilgileri source code içerisine yazılmamalıdır.
- Ortam değişkenleri kullanılmalıdır.
- Rate limiting, brute-force koruması ve temel güvenlik başlıkları değerlendirilmelidir.
- Ödeme sağlayıcısından gelen webhook istekleri doğrulanmalıdır.
- Admin işlemleri audit log ile kaydedilmelidir.
- Hata takip sistemi ve uygulama logları hazırlanmalıdır.
- Düzenli veritabanı yedekleme planı oluşturulmalıdır.
- Kullanıcı verileri için gizlilik, saklama ve silme süreçleri uygulamanın gereksinimlerine uygun biçimde ele alınmalıdır.

> Not: Kişisel veri, ödeme ve yasal metin süreçleri yayına çıkmadan önce ilgili uzmanlar tarafından ayrıca gözden geçirilmelidir.

---

## 14. Test ve Kalite Kriterleri

### Test Kapsamı

Aşağıdaki senaryolar test edilmelidir:

- Rezervasyon oluşturma
- Son kontenjanda eş zamanlı rezervasyon denemesi
- Ödeme başarılı / başarısız akışları
- Rezervasyon iptali ve iade durumu
- Kullanıcı rol ve yetki kontrolleri
- Admin tarafından oturum iptali
- Form doğrulamaları
- Medya silme ve aktif kullanım kontrolü
- API hata cevapları
- Mobil temel rezervasyon akışı

### Yayın Öncesi Kontrol Listesi

- [ ] Tüm içerikler admin panelinden değiştirilebiliyor.
- [ ] Frontend’de üretim için hardcoded içerik kalmadı.
- [ ] Fiyat ve kontenjan backend tarafından doğrulanıyor.
- [ ] Mobil görünüm kontrol edildi.
- [ ] Boş, hata ve yükleniyor ekranları hazırlandı.
- [ ] SEO meta alanları eksiksiz.
- [ ] Rezervasyon sonrası bildirim akışı çalışıyor.
- [ ] Yetkilendirme ve admin erişimi kontrol edildi.
- [ ] Loglama, hata takibi ve yedekleme yaklaşımı belirlendi.
- [ ] Temel erişilebilirlik kontrolleri yapıldı.

---

## 15. Yapay Zeka ile Geliştirme Kuralları

Bu projede Claude veya başka bir yapay zeka asistanı kod üretirken aşağıdaki kurallara uymalıdır.

### Mimari Kurallar

1. Kod yazmadan önce mevcut proje yapısını, veri modelini, endpoint’leri ve mevcut bileşenleri incele.
2. Yeni özellikleri mevcut mimariye uyumlu geliştir; paralel ve tekrar eden sistemler kurma.
3. Üretim kodunda mock veri veya hardcoded içerik bırakma. Geliştirme verisi gerekiyorsa açıkça `seed`, `fixture` veya `mock` olarak ayır.
4. Fiyat, kontenjan, ödeme, yetki ve rezervasyon statüsü gibi kritik verileri frontend kaynaklı kabul etme.
5. Yeni veritabanı alanı eklendiğinde migration, index, ilişki, silme davranışı ve geriye dönük uyumluluğu düşün.
6. Yeni endpoint’lerde validation, authorization, hata formatı ve loglama standartlarını uygula.
7. Mevcut ortak component yeterliyse yeni component üretmek yerine onu genişlet.

### Tasarım Kuralları

1. Jenerik SaaS, Bootstrap veya yapay zeka klişesi tasarımlar üretme.
2. Her yeni ekran için şu soruyu sor: **“Bu ekran, üst segment bir butik takı markasının fiziksel deneyimini dijitale taşıyor mu?”**
3. Sadece estetik uğruna kullanılabilirliği azaltma.
4. Renk, gölge, radius ve animasyon değerlerini mevcut tasarım token’larından kullan.
5. Yeni arayüzlerde loading, empty, error, success ve disabled durumlarını unutma.
6. Masaüstü ve mobil davranışını birlikte düşün.
7. Erişilebilirlik için semantic HTML, klavye kullanımı ve focus durumlarını ihmal etme.

### Kod Çıktısı Kuralları

1. Tüm dosyayı gereksiz yere baştan yazma.
2. Yalnızca değişen dosyaları ve gerekli kod parçalarını paylaş.
3. Her değişiklikte kısa biçimde şunları belirt:
   - Değişen dosya
   - Değişiklik nedeni
   - Varsa migration veya environment variable ihtiyacı
4. Büyük değişikliklerde önce kısa bir uygulama planı ver, ardından kodu parçalara ayır.
5. Belirsiz noktada mimariyi bozacak varsayımlar yapma; mevcut yapıdan en güvenli ve genişletilebilir sonucu çıkar.
6. Kod örnekleri TypeScript ve proje standartlarıyla uyumlu olmalıdır.
7. Hata yönetimini, tip güvenliğini ve edge case’leri atlama.

---

## 16. Definition of Done

Bir özellik ancak aşağıdaki şartlar sağlandığında tamamlanmış kabul edilir:

- Kullanıcı akışı çalışıyor.
- Backend doğrulaması mevcut.
- Yetki kontrolleri uygulandı.
- Loading, error, empty ve success durumları tasarlandı.
- Mobil görünüm kontrol edildi.
- Gerekli testler eklendi veya test senaryosu tanımlandı.
- Admin paneli üzerinden gerekli yönetim işlemleri yapılabiliyor.
- Hardcoded üretim verisi bulunmuyor.
- Tasarım, marka estetiği ve erişilebilirlik ilkeleriyle uyumlu.
- Gerekliyse migration, seed, environment variable ve dokümantasyon güncellendi.

---

## 17. Son Tasarım Kontrol Sorusu

Her yeni ekran, bileşen veya kod değişikliği öncesinde şu kontrol yapılmalıdır:

> Bu çözüm; yalnızca teknik olarak çalışan bir rezervasyon sistemi mi, yoksa müşteriye özenli, zarif, güven veren ve butik bir deneyim sunan dijital bir takı atölyesi mi oluşturuyor?

Cevap ikinci seçenek değilse; tasarım, içerik hiyerarşisi veya kullanıcı akışı yeniden değerlendirilmelidir.
