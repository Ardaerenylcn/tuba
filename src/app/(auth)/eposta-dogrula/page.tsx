import { Suspense } from "react";
import { VerifyEmailResult } from "./result";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "E-posta Doğrulama" };

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-sm">
      <Suspense fallback={<div className="h-11 bg-[var(--bg-subtle)] animate-pulse" />}>
        <VerifyEmailResult />
      </Suspense>
    </div>
  );
}
