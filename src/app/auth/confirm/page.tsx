import { redirect } from "next/navigation";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{
    token_hash?: string;
    type?: string;
    next?: string;
  }>;
}) {
  const { token_hash, type, next = "/roster" } = await searchParams;

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
    redirect(error ? "/login?error=1" : next);
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold tracking-tight">StreamRoll</h1>
      <p className="max-w-xs text-center text-sm text-neutral-500">
        Tap below to finish signing in. (This extra tap keeps mail scanners
        like Apple Mail&apos;s link-privacy check from using up your sign-in
        link before you do.)
      </p>
      <form action={confirm}>
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-6 py-3 text-base font-medium text-white"
        >
          Confirm sign-in
        </button>
      </form>
    </main>
  );
}
