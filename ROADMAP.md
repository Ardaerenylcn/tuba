# Atölye Biz — Geliştirme Yol Haritası

Durum: `[ ]` bekliyor · `[~]` kısmi · `[x]` tamamlandı · `[!]` **sende bekliyor** (dış servis/gizli anahtar/içerik/karar gerektiriyor)

> Bu dosya tek doğ­ruluk kaynağı. Hiçbir madde sessizce atlanmaz; yapılamayanlar `[!]` ile nedeniyle işaretlenir.

---

## 1. Rezervasyon & Satış
- [ ] Bekleme listesi (waitlist) uçtan uca
- [!] Rezervasyon hatırlatma e-postaları — cron + Resend doğrulanmış domain gerekir
- [x] Takvime ekle (.ics) — onay sayfasında indirilebilir
- [ ] Rezervasyon erteleme/tarih değiştirme
- [~] Rezervasyon onay e-postası — şablon yazılabilir; gönderim Resend domain doğrulaması ister
- [!] Grup/özel etkinlik rezervasyonu — akış/fiyat kararı gerekir
- [x] Doluluk / "son X yer" göstergesi (session-calendar) — doğrulandı

## 2. Ödeme (İyzico)
- [!] İyzico webhook tamamlama/doğrulama — İyzico test anahtarları + canlı ödeme mantığı
- [!] İade akışı — İyzico API + canlı test
- [!] Taksit / 3D Secure kontrolü — İyzico
- [ ] Başarısız ödeme tekrar-dene ekranı
- [!] Fatura/makbuz PDF — mali içerik kararı

## 3. Blog
- [x] Editöryel liste + detay tasarımı (önceki turda)
- [x] 7 yazı + markalı kapak görselleri (önceki turda)
- [x] RSS/Atom feed (`/blog/rss.xml`)
- [x] Sitemap blog+program dahil (eksik route'lar eklendi, BASE düzeltildi)
- [x] Sosyal paylaş butonları (WhatsApp/X/kopyala)
- [x] Okuma ilerleme çubuğu
- [ ] Kategori/etiket arşiv + yazar sayfası
- [ ] Blog altı bülten CTA

## 4. Site içi arama
- [x] Global arama (`/ara` — program + blog)
- [~] Header arama girişi (`/ara` ikonu eklendi; ⌘K paleti yok)

## 5. Favoriler
- [ ] Favori programlar (hesaba bağlı istek listesi)

## 6. Kullanıcı hesabı
- [x] Profil düzenleme (ad/telefon) — mevcut, doğrulandı
- [~] Rezervasyon dekontu — hesabım'da .ics takvim indirme eklendi (PDF dekont yok)
- [!] E-posta doğrulama açma — deliverability/karar
- [!] Google ile giriş — Google OAuth kimlik bilgileri
- [!] Bülten abonelik yönetimi — Subscriber modeli + DB migration gerekir (kararın)

## 7. Yorumlar / sosyal kanıt
- [x] Program detayında yıldız ortalaması + yorum sayısı + yorum bölümü
- [!] Müşteriden otomatik yorum toplama — seans sonrası mail (Resend domain)
- [ ] Ana sayfa yorum bölümü zenginleştirme

## 8. Admin
- [x] Dashboard grafikleri (recharts) — zaten mevcuttu, doğrulandı
- [ ] Toplu işlemler
- [x] Gelişmiş filtre/arama/sayfalama (rezervasyonlar: müşteri arama + sayfalama)
- [x] Audit log görünümü — mevcut (filtre+sayfalama+tablo), doğrulandı
- [~] Bildirim güncelleme — polling mevcut (setInterval); SSE/websocket yok
- [ ] E-posta şablonu editörü

## 9. E-posta (Resend + react-email)
- [~] Markalı e-posta şablonları — yazılabilir; gönderim domain doğrulaması ister
- [~] İletişim formu → admin'e mail (mevcut; kullanıcıya otomatik yanıt henüz yok)
- [!] Toplu bülten gönderimi — Resend domain + abone listesi

## 10. Hediye kartı
- [x] Bakiye sorgulama sayfası (`/hediye-karti/bakiye`)
- [!] PDF hediye kartı + e-posta gönderim — tasarım + Resend
- [ ] Satın alma akışında şablon seçimi

## 11. SEO & içerik
- [x] Program structured data (Course + AggregateRating + Review)
- [x] Review schema (Course içinde aggregateRating + review)
- [x] Sayfa bazlı OG görseli (program+blog kapağı) — doğrulandı
- [x] Markalı 404 / error sayfaları
- [!] EN dil / hreflang — çeviri içeriği gerekir

## 12. Performans
- [ ] Görsel optimizasyon denetimi (sizes/blur)
- [ ] Cache stratejisi (uygun yerlerde ISR/revalidate)
- [ ] Hero (three.js) mobil lazy-load
- [ ] Lighthouse ölçüm + düzeltme

## 13. Erişilebilirlik
- [ ] Renk kontrastı denetimi
- [x] focus-visible (mevcut) + skip-to-content linki eklendi
- [ ] alt / aria-live / modal focus trap

## 14. Test & kalite
- [!] E2E (Playwright) — kurulum + zaman
- [ ] Birim testler (rezervasyon/hediye kartı mantığı)
- [~] CI (GitHub Actions dosyası hazır; token `workflow` yetkisi olmadığı için elle eklenecek)
- [ ] Kalan idiomatik lint uyarılarını kapat

## 15. Güvenlik
- [x] Güvenlik başlıkları (next.config)
- [x] Rate limiting (iletişim + rezervasyon; bellek-içi)
- [!] Form spam koruması (Turnstile/hCaptcha) — site key gerekir
- [x] Dosya yükleme doğrulaması (boyut+mime mevcut; uzantı mime'dan türetildi)

## 16. Analitik & izleme
- [!] Vercel Analytics / GA4 — hesap/anahtar
- [!] Sentry hata izleme — hesap/DSN
- [ ] Dönüşüm eventi (rezervasyon tamamlandı)

## 17. Mobil & PWA
- [~] Web manifest (önceki turda eklendi)
- [ ] PWA tamamlama (offline shell)
- [!] Gerçek cihaz 320–1440px görsel QA — görsel/insan denetimi

## 18. DevOps / yayın & içerik
- [x] `.gitignore` gece-otomasyonu artıkları
- [!] Production deploy doğrulama — Vercel erişimi/karar
- [!] Program/koleksiyon gerçek fotoğrafları — görsel varlıklar sende
- [ ] DB migration disiplini kontrolü
