"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type State = "idle" | "loading" | "success" | "error" | "invalid";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const urlError = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (urlError === "INVALID_TOKEN" || (!token && !urlError)) {
      setState("invalid");
    }
  }, [token, urlError]);

  const mismatch = confirm.length > 0 && password !== confirm;
  const weak = password.length > 0 && password.length < 8;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || password !== confirm || password.length < 8) return;
    setState("loading");
    setErrorMsg("");

    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (error) {
      setState("error");
      setErrorMsg(
        error.status === 400
          ? "Bağlantı geçersiz veya süresi dolmuş. Lütfen tekrar talep edin."
          : "Bir hata oluştu. Lütfen tekrar deneyin."
      );
      return;
    }

    setState("success");
    setTimeout(() => router.push("/giris"), 2500);
  }

  if (state === "invalid") {
    return (
      <div className="border border-red-200 bg-red-50 p-6 text-center">
        <p className="mb-1 text-sm font-medium text-red-700">Geçersiz bağlantı</p>
        <p className="text-sm text-red-600">
          Bu bağlantı geçersiz veya süresi dolmuş.{" "}
          <Link href="/sifremi-unuttum" className="underline underline-offset-4">
            Yeni bir bağlantı talep edin.
          </Link>
        </p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="border border-[var(--border)] bg-[var(--bg-subtle)] p-6 text-center">
        <p className="mb-1 text-sm font-medium text-[var(--text-primary)]">Şifreniz güncellendi</p>
        <p className="text-sm text-[var(--text-muted)]">
          Giriş sayfasına yönlendiriliyorsunuz…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
          Yeni Şifre
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={state === "loading"}
          className="h-11 border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] disabled:opacity-50"
          placeholder="En az 8 karakter"
        />
        {weak && <p className="text-xs text-amber-600">Şifre en az 8 karakter olmalıdır.</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="confirm" className="text-xs font-medium tracking-[0.1em] uppercase text-[var(--text-muted)]">
          Şifre Tekrar
        </label>
        <input
          id="confirm"
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={state === "loading"}
          className={`h-11 border bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--text-primary)] disabled:opacity-50 ${
            mismatch ? "border-red-400" : "border-[var(--border)]"
          }`}
          placeholder="••••••••"
        />
        {mismatch && <p className="text-xs text-red-600">Şifreler eşleşmiyor.</p>}
      </div>

      {state === "error" && (
        <p role="alert" className="text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={state === "loading" || mismatch || weak || !password || !confirm}
        className="h-11 w-full bg-[var(--text-primary)] text-xs font-medium tracking-[0.15em] uppercase text-[var(--surface)] transition-colors hover:bg-[var(--color-stone-700)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state === "loading" ? "Kaydediliyor…" : "Şifremi Güncelle"}
      </button>
    </form>
  );
}
