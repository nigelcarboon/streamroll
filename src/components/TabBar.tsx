"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/roster", label: "Roster" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/reminder", label: "Reminder" },
] as const;

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 flex border-t border-line bg-ground/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`flex-1 py-4 text-center text-sm font-medium ${
              active ? "text-signal" : "text-static"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
