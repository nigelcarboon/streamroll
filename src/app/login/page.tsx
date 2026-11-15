"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "@/components/Wordmark";

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
      <p className="max-w-xs text-center text-sm text-static">
        Sign-in link sent to <span className="text-paper">{email}</span>. Check
        your email.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-xs flex-col gap-3"
    >
      <label htmlFor="email" className="sr-only">
        Email address
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-md border border-line bg-standby px-4 py-3 text-base text-paper outline-none placeholder:text-static focus:border-signal"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-md bg-signal px-4 py-3 text-base font-semibold text-ground disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send sign-in link"}
      </button>
      {status === "error" && (
        <p role="alert" className="text-sm text-renewal">
          That didn&apos;t send. Try again.
        </p>
      )}
      {showLinkError && (
        <p role="alert" className="text-sm text-renewal">
          That link expired or was already used. Send a new one.
        </p>
      )}
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-10 px-6">
      <div className="flex flex-col items-center gap-3">
        <h1>
          <Wordmark size="lg" />
        </h1>
        <p className="text-sm text-static">
          Your streaming rotation, planned in advance.
        </p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
