"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    setStatus(error ? "error" : "sent");
  }

  const showLinkError = status === "idle" && searchParams.get("error") === "1";

  if (status === "sent") {
    return (
      <p className="text-center text-sm text-neutral-500">
        Check your email — we sent a sign-in link to {email}.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-xs flex-col gap-3"
    >
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-md border border-neutral-300 px-4 py-3 text-base outline-none focus:border-neutral-900"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-md bg-neutral-900 px-4 py-3 text-base font-medium text-white disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send sign-in link"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-600">
          Something went wrong — try again.
        </p>
      )}
      {showLinkError && (
        <p className="text-sm text-red-600">
          That link expired or was already used — send a new one.
        </p>
      )}
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6">
      <h1 className="text-2xl font-semibold tracking-tight">StreamRoll</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
