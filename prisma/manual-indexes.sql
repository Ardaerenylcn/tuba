-- Prisma schema kısmi (partial) unique index ifade edemediği için elle yönetilir.
-- `prisma db push` bu index'i düşürürse tekrar çalıştırın.
--
-- Amaç: Aynı seansa, aynı e-posta ile ikinci bir AKTİF rezervasyonu DB seviyesinde
-- engelleyerek yarış koşullarına karşı güvence sağlamak. İptal/iade/gelmedi/tamamlandı
-- durumları index'e dahil değildir (yeni rezervasyona engel olmaz).

CREATE UNIQUE INDEX IF NOT EXISTS reservations_active_session_email_unique
  ON reservations ("sessionId", "customerEmail")
  WHERE status IN ('pending', 'confirmed', 'waitlisted');
