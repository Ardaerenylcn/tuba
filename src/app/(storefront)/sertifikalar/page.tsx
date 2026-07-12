import { db } from "@/lib/db";
import { ProgramCard } from "@/components/storefront/program-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sertifika Programları",
  description: "Takı tasarımı ve üretimi alanında kapsamlı sertifika programları.",
};

async function getCertificates() {
  return db.program.findMany({
    where: { type: "sertifikalar", status: "published" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { coverImage: { select: { url: true } } },
  });
}

export default async function CertificatesPage() {
  const certificates = await getCertificates();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-16 max-w-xl">
        <p className="mb-4 text-xs font-medium tracking-[0.3em] uppercase text-[var(--text-muted)]">
          Sertifika Programları
        </p>
        <h1 className="mb-4 text-4xl font-light tracking-tight text-[var(--text-primary)] sm:text-5xl">
          Ustalığa giden yol.
        </h1>
        <p className="text-base leading-relaxed text-[var(--text-secondary)]">
          Birden fazla modülden oluşan sertifika programlarımız, takı yapımını ciddiye alan
          katılımcılar için tasarlanmıştır.
        </p>
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 gap-px bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 border border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)]">Henüz yayınlanmış sertifika programı bulunmuyor.</p>
          <p className="text-xs text-[var(--text-disabled)]">Yakında yeni programlar eklenecek.</p>
        </div>
      )}
    </div>
  );
}
