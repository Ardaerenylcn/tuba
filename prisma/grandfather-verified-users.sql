-- E-posta doğrulaması zorunlu hâle getirildiğinde (requireEmailVerification: true)
-- bu tarihten ÖNCE kayıt olmuş kullanıcılar `emailVerified = false` oldukları için
-- giriş yapamaz. Bu script mevcut kullanıcıları doğrulanmış kabul eder.
--
-- SADECE BİR KEZ, doğrulama devreye alınırken çalıştırılır.
-- Tarihi kendi devreye alma anınıza göre güncelleyin.

UPDATE users
SET "emailVerified" = true,
    "updatedAt" = now()
WHERE "emailVerified" = false
  AND "createdAt" < '2026-08-09';
