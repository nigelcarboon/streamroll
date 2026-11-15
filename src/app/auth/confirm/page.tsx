import { redirect } from "next/navigation";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { Wordmark } from "@/components/Wordmark";

/** Only ever redirect to a path inside this app, never to another site. */
function safePath(next: string | undefined) {
  if (!next || !next.startsWith("/") || /^\/[/\\]/.test(next)) return "/roster";
  return next;
}

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{
    token_hash?: string;
    type?: string;
    next?: string;
  }>;
}) {
  const { token_hash, type, next } = await searchParams;
  const destination = safePath(next);

  if (!token_hash || !type) {
    redirect("/login?error=1");
  }

  async function confirm() {
    "use server";
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: token_hash!,
    });
    redirect(error ? "/login?error=1" : destination);
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6">
      <h1>
        <Wordmark size="lg" />
      </h1>
      <p className="max-w-xs text-center text-sm text-static">
        One more tap to finish signing in. It stops mail scanners using up
        your link before you do.
      </p>
      <form action={confirm}>
        <button
          type="submit"
          className="rounded-md bg-signal px-6 py-3 text-base font-semibold text-ground"
        >
          Confirm sign-in
        </button>
      </form>
    </main>
  );
}
