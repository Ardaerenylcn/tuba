import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-server";
import { ProgramForm } from "@/components/admin/program-form";
import { DeleteProgramButton } from "@/components/admin/delete-program-button";
import { SessionsPanel } from "@/components/admin/sessions-panel";
import { FaqsPanel } from "@/components/admin/faqs-panel";
import { GalleryImagesPanel } from "@/components/admin/gallery-images-panel";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const program = await db.program.findUnique({ where: { id }, select: { title: true } });
  return { title: program ? `${program.title} | Admin` : "Program | Admin" };
}

export default async function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const program = await db.program.findUnique({
    where: { id },
    include: {
      _count: { select: { sessions: true } },
      coverImage: { select: { url: true } },
    },
  });

  if (!program) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/programlar"
            className="mb-3 inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            ← Programlar
          </Link>
          <h1 className="text-xl font-medium text-[var(--text-primary)]">{program.title}</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {program._count.sessions} oturum
          </p>
        </div>
        <DeleteProgramButton
          id={program.id}
          sessionCount={program._count.sessions}
        />
      </div>

      <ProgramForm
        initial={{
          id: program.id,
          type: program.type,
          title: program.title,
          slug: program.slug,
          shortDescription: program.shortDescription,
          description: (program.description as import("@tiptap/react").JSONContent | null) ?? null,
          basePrice: Number(program.basePrice),
          currency: program.currency,
          defaultCapacity: program.defaultCapacity ?? undefined,
          durationMinutes: program.durationMinutes ?? undefined,
          level: program.level ?? undefined,
          status: program.status,
          seoTitle: program.seoTitle ?? undefined,
          seoDescription: program.seoDescription ?? undefined,
          coverImageId: program.coverImageId ?? null,
          coverImageUrl: program.coverImage?.url ?? null,
          coverImagePosition: program.coverImagePosition ?? "center center",
        }}
      />

      <SessionsPanel
        programId={program.id}
        defaultCapacity={program.defaultCapacity ?? 6}
        durationMinutes={program.durationMinutes ?? 180}
        basePrice={Number(program.basePrice)}
      />

      <GalleryImagesPanel programId={program.id} initialUrls={program.galleryImageIds} />
      <FaqsPanel programId={program.id} />
    </div>
  );
}
