import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const TABS = [
  { href: "/roster", label: "Roster" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/reminder", label: "Reminder" },
] as const;

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
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 overflow-y-auto pb-16">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 flex border-t border-neutral-200 bg-white">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 py-3 text-center text-sm font-medium text-neutral-600"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
