/** Üyelik durumunu isActive + emailVerified'e göre etiket/rozet tonuna çevirir.
 *  Server ve client bileşenlerinin ikisinden de güvenle çağrılabilir. */
export function membershipStatus(isActive: boolean, emailVerified: boolean): { label: string; tone: string } {
  if (!emailVerified) return { label: "E-posta Doğrulanmadı", tone: "bg-orange-50 text-orange-600" };
  if (isActive) return { label: "Aktif", tone: "bg-green-50 text-green-700" };
  return { label: "Pasif / Engelli", tone: "bg-red-50 text-red-600" };
}
