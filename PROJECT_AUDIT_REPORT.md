# Atölye Tuba — Proje Denetim Raporu

**Tarih:** 2026-07-13
**Kapsam:** Yeni özellik değil; mevcut geliştirmelerin denetimi, hata düzeltme, routing/404, güvenlik ve tasarım/nav tutarlılığı.

---

## Proje Özeti

- **Framework:** Next.js 16.2.9 (App Router, Turbopack), React 19.2.
- **Veri:** Prisma 7 + PostgreSQL (Supabase pooler), `@prisma/adapter-pg`.
- **Auth:** better-auth (`admin` / `editor` / kullanıcı rolleri), server tarafı `getSession` / `requireAuth`.
- **Yapı:** `(storefront)` (public), `(auth)`, `admin` route grupları; `api/v1/**` REST uçları.
- **Genel durum:** Backend (rezervasyon, iptal, hediye kartı, bildirim) beklenenden sağlam. Ana sorunlar **içerik durumu/UX kaynaklı 404'ler** ve **hardcode edilmiş kırık navigasyon linkleri** idi.

---

## Tespit Edilen Kritik Hatalar

### 1. Blog kullanıcı tarafı 404 (birincil sorun) — ÇÖZÜLDÜ
- **Etkilenen bölüm:** `(storefront)/blog/[slug]`, admin blog formu.
- **Kök neden:** Admin blog formunda **iki ayrı kontrol** vardı: bir "Durum" seçici (varsayılan *Taslak*) ve ayrı bir "Yayın tarihi" alanı. Kullanıcı yayın tarihini giriyor ama "Durum"u *Taslak* olarak bırakıyordu. Sonuç: DB'de `status: "draft"` ama `publishedAt` dolu bir kayıt. Storefront `getPostBySlug` yalnızca `status === "published"` kayıtları gösterdiği için detay sayfası doğru şekilde `notFound()` veriyordu — yani veri "yayınlanmış" sanılıyordu ama değildi.
- **Önem:** Yüksek (satış/pazarlama içeriği görünmüyor).
- **Çözüm:**
  - `blog-form.tsx` yeniden düzenlendi: belirsiz tek "Kaydet" butonu yerine **"Yayınla / Güncelle"** ve **"Taslak olarak kaydet"** (ve düzenlemede "Arşivle") aksiyonları eklendi. Durum artık aksiyondan türetiliyor; kafa karıştıran durum seçici bir **durum rozetiyle** değiştirildi. "Yayınla"da tarih boşsa şimdi yayınlanır.
  - Mevcut yanlış kalmış tek yazı (`gumus-takiya-baslangic-rehberi`) yayına alındı; artık `/blog` listesinde ve `/blog/<slug>` detayında görünüyor (HTTP 200, doğrulandı).
- **Not:** Backend (`POST`/`PATCH /api/v1/admin/blog`) ve `lib/blog.ts` mantığı zaten doğruydu; sorun tamamen form UX'iydi (kök neden düzeltildi, belirti değil).

### 2. `/koleksiyonlar` index sayfası eksik (404) — ÇÖZÜLDÜ
- **Etkilenen bölüm:** Footer "Koleksiyonlar" linki.
- **Kök neden:** Yalnızca `koleksiyonlar/[slug]/page.tsx` vardı; index (`koleksiyonlar/page.tsx`) yoktu. Footer `/koleksiyonlar`'a link veriyordu → 404.
- **Çözüm:** `siteContent` `collections` verisinden (DEFAULT_COLLECTIONS fallback) beslenen, detay sayfasıyla aynı görsel dili kullanan yeni bir index sayfası oluşturuldu. `imageUrl` varsa görsel, yoksa dekoratif halka + arka plan gösterir. Boş durum ele alındı.

### 3. Footer'da 7 kırık (hardcode) navigasyon linki — ÇÖZÜLDÜ
- **Kök neden:** Footer sütunları var olmayan route'lara işaret ediyordu.
- **404 veren linkler:** `/koleksiyonlar/yeni`, `/koleksiyonlar/populer`, `/atolyeler/jewelry-courses`, `/atolyeler/wax-carving`, `/atolyeler/private-lessons`, `/yasal/kargo`, `/yasal/kullanim-kosullari`.
- **Çözüm:** Footer sütunları yalnızca **doğrulanmış, var olan** route'lara (Keşfet / Programlar / Kurumsal / Yardım) yeniden yapılandırıldı. Tüm linkler HTTP 200 döndürüyor (doğrulandı).

---

## Düzeltilen Route ve 404 Sorunları

Dev sunucusunda tüm public route'lar taranarak durum kodları doğrulandı:

| Sorun | Önce | Sonra |
|------|------|-------|
| Blog detay (yayınlanmış yazı) | 404 | 200 |
| `/koleksiyonlar` | 404 | 200 |
| Footer: `/koleksiyonlar/yeni`, `/populer` | 404 | Kaldırıldı → geçerli linkler |
| Footer: `/atolyeler/jewelry-courses`, `/wax-carving`, `/private-lessons` | 404 | Kaldırıldı → kategori sayfaları |
| Footer: `/yasal/kargo`, `/yasal/kullanim-kosullari` | 404 | Kaldırıldı → var olan yasal sayfalar |

Geçersiz slug'lar (blog, koleksiyon) beklendiği gibi düzgün 404 veriyor.

---

## Düzeltilen Fonksiyonel / Kalite Hataları

- **Internal `<a>` → `<Link>`:** 12 iç sayfa navigasyonu tam sayfa yeniden yükleme yapan `<a>` yerine `next/link`'e taşındı (SPA navigasyon, `@next/next/no-html-link-for-pages` hataları giderildi). Etkilenen: auth formları, storefront breadcrumb'ları, iletişim SSS linki, admin dashboard/programlar.
- **CSV indirme linki:** `/api/v1/admin/export/reservations` bir sayfa değil dosya indirme ucu; `<a download>` olarak korundu, ilgili lint kuralı yalnızca o satırda susturuldu.
- **ESLint config:** Prisma tarafından üretilen `src/generated/**` lint kapsamı dışına alındı — sahte 500+ hata (minified generated kod) elendi. Gerçek hata sayısı 542 → 17'ye düştü.

---

## Doğrulanan (Sağlam Bulunan) Alanlar

- **Rezervasyon oluşturma (`POST /api/v1/reservations`):** Transaction içinde kapasite kontrolü, aktif-durum bazlı mükerrer engeli (aynı seans + userId/e-posta), hediye kartı bakiye düşümü, kapasite dolunca seansı `full` işaretleme, P2002 (kısmi unique index) yakalama. Sağlam.
- **Rezervasyon iptali (`POST /api/v1/reservations/[id]/cancel`):** Sahiplik kontrolü (userId **veya** e-posta), geçmiş oturum engeli, kapasite iadesi, hediye kartı bakiye iadesi. **IDOR yok.**
- **Hesabım (`/hesabim`):** `requireAuth` + yalnızca kullanıcının kendi (userId/e-posta) rezervasyonları. **IDOR yok.**
- **Admin API yetkilendirmesi:** Blog uçları `checkAdmin()` (admin/editor) ile korunuyor.

---

## Güvenlik Düzeltmeleri / Doğrulamaları

- Kullanıcı veri izolasyonu (rezervasyon listeleme/iptal) server tarafında sahiplikle sınırlanmış — doğrulandı, açık bulunmadı.
- Admin blog CRUD uçları server tarafında rol kontrolü yapıyor — doğrulandı.
- Bu turda yeni bir güvenlik açığı kapatılmadı; mevcut kontroller yeterli bulundu. (Aşağıdaki "Kalan Riskler"e bakınız.)

---

## Değiştirilen / Eklenen Dosyalar

| Dosya | Değişiklik |
|------|-----------|
| `src/components/admin/blog-form.tsx` | Yayınla/Taslak/Arşivle aksiyonları; durum rozeti; belirsiz tek buton kaldırıldı (blog 404 kök nedeni). |
| `src/app/(storefront)/koleksiyonlar/page.tsx` | **Yeni** — eksik koleksiyon index sayfası. |
| `src/components/storefront/site-footer.tsx` | 7 kırık link kaldırıldı; sütunlar var olan route'larla yeniden yapılandırıldı. |
| `src/app/(storefront)/iletisim/content.tsx` | SSS linki `<a>` → `<Link>` + import. |
| `src/app/(storefront)/rezervasyon/page.tsx` | 2 iç link `<Link>`'e taşındı. |
| `src/app/(storefront)/atolyeler/[slug]/page.tsx`, `masterclass/[slug]`, `sertifikalar/[slug]` | Breadcrumb `<a>` → `<Link>`. |
| `src/app/(auth)/sifre-sifirla/form.tsx`, `sifremi-unuttum/page.tsx`, `src/components/auth/login-form.tsx` | Auth linkleri `<Link>`. |
| `src/app/admin/dashboard/page.tsx`, `admin/programlar/yeni/page.tsx` | İç linkler `<Link>`. |
| `src/app/admin/rezervasyonlar/page.tsx` | CSV indirme `<a download>` + hedefli eslint-disable. |
| `eslint.config.mjs` | `src/generated/**` ignore. |

---

## Çalıştırılan Testler

| Kontrol | Komut | Sonuç |
|--------|-------|-------|
| TypeScript typecheck | `tsc --noEmit` | ✅ Temiz (0 hata) |
| ESLint | `eslint .` | ✅ 0 `no-html-link` hatası; kalan 17 hata tip/kozmetik/hook (build'i engellemez) |
| Production build | `next build` | ✅ Başarılı (exit 0) |
| Route sağlık taraması | dev sunucu üzerinde 30+ route curl | ✅ Public route'lar 200; auth route'lar 307 redirect |
| Blog akışı | `/blog`, `/blog/<slug>` | ✅ 200 + içerik; geçersiz slug 404 |

---

---

## Ek Tur (2026-07-13, 2. oturum): Bağımsız Doğrulama + Lint Temizliği

Önceki turun iddiaları körlemesine kabul edilmeden **çalışan dev sunucusu ve taze build üzerinde bağımsız olarak** yeniden doğrulandı.

### Canlı route doğrulaması (HTTP)
Çalışan dev sunucusunda (`localhost:3000`) gerçek HTTP istekleriyle:
- **Public route'lar (16):** `/`, `/programlar`, `/takvim`, `/blog`, `/koleksiyonlar`, `/hakkimizda`, `/iletisim`, `/sss`, `/galeri`, `/rezervasyon`, `/yasal/*` (3), `/giris`, `/kayit` → **hepsi 200**.
- **Korumalı route'lar:** `/hesabim` ve `/admin` → **307 redirect** (giriş yoksa) — beklenen davranış.
- **Blog uçtan uca:** `/blog` listesi **7 yayınlanmış yazı** render ediyor; her yazı slug'ı detayda **200**; geçersiz slug (`/blog/bu-slug-yok-12345`) → **düzgün 404**. Blog 404 sorununun gerçekten çözüldüğü doğrulandı.

### Güvenlik — bağımsız kod doğrulaması
- **Rezervasyon iptali (IDOR):** `cancel/route.ts` sahiplik kontrolü `reservation.userId === auth.user.id || customerEmail eşleşmesi`; değilse `forbidden`. **IDOR yok** — doğrulandı.
- **`/hesabim` izolasyonu:** `requireAuth()` + `where: { OR: [{ userId }, { customerEmail: user.email }] }`. Kullanıcı yalnızca kendi rezervasyonlarını görüyor — doğrulandı.
- **Blog XSS:** İçerik admin/editör tarafından Tiptap **JSON** olarak yazılıyor; `generateHTML` kısıtlı bir düğüm/mark setiyle render ediyor (ham HTML enjeksiyonu yok). Düşük risk.

### Lint temizliği (bu turda uygulandı)
Gerçek lint **hataları 17 → 7'ye** düşürüldü (kalan 7'nin tamamı idiomatik SSR-mount `setState` kalıbı; fonksiyonel hata değil, build'i engellemiyor):
- `src/lib/api.ts` — `handleZodError`'daki 2 `any` kaldırıldı (tiplenmiş fallback).
- `src/app/api/v1/admin/programs/route.ts` + `[id]/route.ts` — audit log `oldValue`/`newValue` için 4 `any` → `Prisma.InputJsonValue` cast'ine çevrildi (davranış korundu).
- `src/app/admin/site/logo/page.tsx` — 4 kaçırılmamış karakter (`'`, `"`) HTML entity'lerine çevrildi.

### Kalite kapıları (bu tur)
| Kontrol | Komut | Sonuç |
|--------|-------|-------|
| TypeScript | `tsc --noEmit` | ✅ 0 hata |
| ESLint | `eslint .` | ✅ 17 → 7 hata (kalan 7 idiomatik `set-state-in-effect`) |
| Production build | `next build` | ✅ Başarılı (exit 0), lint fix'leri sonrası tekrar |
| Canlı route taraması | dev sunucu curl (18 route) | ✅ Public 200, korumalı 307, blog uçtan uca doğru |

---

## Ek Tur: Admin Fonksiyonel Test + Responsive Denetim

Bu tur, geçici bir admin oturum çerezi (better-auth imzalı, test sonrası DB'den silindi) ile admin modülleri **kimlik doğrulamalı** olarak uçtan uca test edildi.

### Admin sayfaları (kimlik doğrulamalı)
Tüm admin sayfaları **HTTP 200** döndürüyor: dashboard, rezervasyonlar, oturumlar, müşteriler, kullanıcılar, blog (+yeni), yorumlar, programlar (+yeni), türler, galeri, medya, hediye-kartları, indirim-kodları, ödemeler, audit-log, ayarlar, banner, içerik, site/* (9 alt sayfa). `/admin` → `/admin/dashboard` yönlendirmesi (307) beklendiği gibi.

### Admin read API'leri
`notifications`, `reviews` (1 yayında), `programs` (12), `categories` (4), `gift-cards`, `discount-codes`, `blog` (1) → hepsi 200 ve doğru veri. `users` ve `media` koleksiyon uçları yok (404) — bunlar **server component** olarak DB'den doğrudan okunuyor (sayfalar 200), mimari tercih; hata değil.

### Bildirim modülü — uçtan uca doğrulandı
Test bildirimi oluştur → `GET` `unreadCount: 1` + liste → `POST /read {id}` → `unreadCount: 0` → temizlendi. Rozet/okundu akışı **çalışıyor** (rezervasyon `POST`'u da aynı `notification.create`'i kullanıyor).

### Takvim / oturumlar & yorumlar
Program oturumları API'si (`/api/v1/admin/programs/[id]/sessions`) 200. Yorumlar admin API 200; yayınlanmış yorum ana sayfada render ediliyor.

### Responsive denetim
- **Admin sidebar/mobil menü:** Sağlam. Masaüstü rayı `lg:flex`, mobil hamburger `lg:hidden`; drawer overlay + scroll-lock + route değişiminde kapanma mevcut.
- **Admin tabloları:** rezervasyonlar, müşteriler, ödemeler, hediye-kartları, audit-log → tümü `overflow-x-auto` sarmalayıcıya sahip (mobilde yatay kaydırma). kullanıcılar/indirim-kodları kart/flex düzeni kullanıyor.
- **Storefront:** `w-screen`/`100vw`/sabit-px genişlik kaynaklı taşma bulunmadı.
- **Eklenen koruma:** `body { overflow-x: clip }` — 320–1440px arası kazara yatay taşmaya karşı güvenlik ağı (sticky/fixed konumlamayı bozmaz).

> Not: Gerçek tarayıcı viewport'unda (320/375/430/768/1024/1280/1440px) piksel-piksel görsel denetim yapılmadı; yukarıdakiler kod/statik analiz ve HTTP davranışı üzerinedir. Görsel doğrulama kullanıcı tarafında önerilir.

---

## Kalan Sorunlar / Kalan Riskler

Aşağıdakiler bu turda **kapatılmadı**; dürüstlük adına açıkça belirtiliyor:

1. **Rezervasyon kapasite yarış durumu:** Transaction var ama seansta satır kilidi (`SELECT ... FOR UPDATE`) yok; yüksek eşzamanlılıkta teorik olarak kontenjan aşımı mümkün. Mükerrer için P2002 koruması var, kapasite için yok.
2. **Kalan lint uyarıları (17 hata / 27 uyarı):** `no-explicit-any` (6), `no-unescaped-entities` (4, kozmetik), `setState in effect` (idiomatik SSR-mount/loading kalıpları — fonksiyonel hata değil). Build'i engellemiyor.
3. **Responsive/tasarım denetimi:** Admin modülleri kimlik doğrulamalı olarak fonksiyonel test edildi (yukarıdaki "Ek Tur"). Ancak 320–1440px arası **gerçek tarayıcı viewport'unda piksel-piksel görsel denetim yapılmadı** — statik/kod analizi ve HTTP davranışıyla sınırlı.
4. **`site-header` `useEffect` scroll listener** ve diğer client bileşenler kod düzeyinde sağlam görünüyor; tarayıcı testi yapılmadı.

---

## Benim (kullanıcı) Test Etmem Gerekenler

1. **Admin blog:** `/admin/blog/yeni` → başlık + içerik gir → **"Yayınla"** → `/blog` ve `/blog/<slug>` yeni yazıyı göstermeli. Ardından aynı yazıyı düzenle → **"Taslak olarak kaydet"** → public tarafta kaybolmalı.
2. **Zamanlanmış yayın:** Blog formunda gelecek tarihli "Yayın tarihi" + "Yayınla" → o tarihe kadar public'te görünmemeli.
3. **Footer:** Tüm footer linklerine tıkla → hiçbiri 404 vermemeli.
4. **Koleksiyonlar:** `/koleksiyonlar` → kartlar → detay sayfaları açılmalı.
5. **Rezervasyon:** Bir seans seç → rezervasyon yap → `/hesabim`'da görünmeli → iptal et → kapasite geri gelmeli. Aynı seansa aynı e-postayla ikinci kez → engellenmeli.
