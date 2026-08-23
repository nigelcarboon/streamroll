import Link from "next/link";

const TABS = [
  { href: "/roster", label: "Roster" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/reminder", label: "Reminder" },
] as const;

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
