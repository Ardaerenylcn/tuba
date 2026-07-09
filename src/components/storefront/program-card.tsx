import Link from "next/link";
import Image from "next/image";
import type { Program } from "@/generated/prisma";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Başlangıç",
  intermediate: "Orta",
  advanced: "İleri",
  all_levels: "Her Seviye",
};

const TYPE_LABELS: Record<string, string> = {
  workshop: "Atölye",
  certificate: "Sertifika",
  masterclass: "Masterclass",
};

interface ProgramCardProps {
  program: Program & { coverImage?: { url: string } | null };
}

export function ProgramCard({ program }: ProgramCardProps) {
  return (
    <Link
      href={`/${program.type}/${program.slug}`}
      className="group flex flex-col bg-[var(--surface)] p-8 transition-colors duration-[var(--duration-base)] hover:bg-[var(--bg-subtle)]"
    >
      {/* Type + Level */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--text-muted)]">
          {TYPE_LABELS[program.type] ?? program.type}
        </span>
        {program.level && (
          <>
            <span className="text-[var(--border-strong)]">·</span>
            <span className="text-[10px] tracking-[0.1em] text-[var(--text-muted)]">
              {LEVEL_LABELS[program.level] ?? program.level}
            </span>
          </>
        )}
      </div>

      {/* Cover image */}
      <div className="mb-6 aspect-[3/4] w-full overflow-hidden border border-[var(--border)] bg-[var(--bg-muted)]">
        {program.coverImage?.url ? (
          <Image
            src={program.coverImage.url}
            alt={program.title}
            width={400}
            height={300}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ objectPosition: program.coverImagePosition ?? "center center" }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs text-[var(--text-disabled)]">Görsel</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        <h3 className="mb-2 text-base font-medium text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
          {program.title}
        </h3>
        <p className="mb-6 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
          {program.shortDescription}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-base font-light text-[var(--text-primary)]">
            {Number(program.basePrice).toLocaleString("tr-TR")} ₺
          </span>
          {program.durationMinutes && (
            <span className="text-xs text-[var(--text-muted)]">
              {program.durationMinutes < 60
                ? `${program.durationMinutes} dk`
                : `${Math.floor(program.durationMinutes / 60)} sa`}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
