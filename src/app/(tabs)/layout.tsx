import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TabBar } from "@/components/TabBar";
import { Wordmark } from "@/components/Wordmark";
import { signOut } from "./actions";

export default async function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded")
      .eq("id", user.id)
      .single();

    if (profile && !profile.onboarded) {
      redirect("/onboarding");
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <header className="flex items-center justify-between px-6 pt-6">
        <Wordmark />
        <div className="flex items-center gap-4 text-sm text-static">
          <Link href="/onboarding">Services</Link>
          <form action={signOut}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </header>
      <main className="flex-1 pb-24">{children}</main>
      <TabBar />
    </div>
  );
}
