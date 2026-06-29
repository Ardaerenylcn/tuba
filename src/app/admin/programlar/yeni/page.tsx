import { ProgramForm } from "@/components/admin/program-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Yeni Program | Admin" };

export default function NewProgramPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <a href="/admin/programlar" className="mb-4 inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          ← Programlar
        </a>
        <h1 className="text-xl font-medium text-[var(--text-primary)]">Yeni Program</h1>
      </div>
      <ProgramForm />
    </div>
  );
}
