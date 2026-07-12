import Link from "next/link";
import { BlogForm } from "@/components/admin/blog-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Yeni Yazı | Blog | Admin" };

export default function NewBlogPostPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/blog" className="mb-3 inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">← Blog</Link>
        <h1 className="text-xl font-medium text-[var(--text-primary)]">Yeni Yazı</h1>
      </div>
      <BlogForm />
    </div>
  );
}
