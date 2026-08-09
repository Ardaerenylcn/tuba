// Türkçe büyük harfler için `toLowerCase()` tek başına yetmez:
// "İ".toLowerCase() → "i" + U+0307 (birleşen nokta) döndürür ve bu nokta
// [a-z0-9] dışı kaldığı için tireye dönüşür ("İstanbul" → "i-stanbul").
// Bu yüzden Türkçe karakterler küçültmeden ÖNCE eşlenir, ardından kalan
// birleşen işaretler NFD ile ayrıştırılıp atılır.
const TR_MAP: Record<string, string> = {
  İ: "I", I: "I", ı: "i",
  Ğ: "G", ğ: "g",
  Ü: "U", ü: "u",
  Ş: "S", ş: "s",
  Ö: "O", ö: "o",
  Ç: "C", ç: "c",
};

export function slugify(str: string) {
  return str
    .replace(/[İIıĞğÜüŞşÖöÇç]/g, (ch) => TR_MAP[ch] ?? ch)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Kesme/t\u0131rnak i\u015faretleri ay\u0131r\u0131c\u0131 de\u011fil, tamamen at\u0131l\u0131r:
    // "Telkari'ye" \u2192 telkariye, "Charm'lar" \u2192 charmlar (mevcut verilerin konvansiyonu).
    .replace(/['\u2019\u2018"\u201c\u201d]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
