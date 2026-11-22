import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ImportForm } from "./ImportForm";

export default async function ImportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: services }, { data: existing }] = await Promise.all([
    supabase.from("services").select("id, name").order("name"),
    supabase.from("watchlist_items").select("title").eq("user_id", user.id),
  ]);

  return (
    <div className="px-6 py-8">
      <Link href="/watchlist" className="text-sm text-static">
        ← Watchlist
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">
        Paste a list
      </h1>
      <p className="mt-2 text-sm text-static">
        One title per line. Bullets, numbers and ticks are cleaned up. If a
        line names a service, like &ldquo;Fisk (ABC)&rdquo; or &ldquo;The Bear
        - Disney+&rdquo;, or sits under a heading like &ldquo;Netflix&rdquo;,
        it gets matched. Anything that looks like a title already on your
        list is flagged and left unticked. Check the preview before adding.
      </p>
      <ImportForm
        services={services ?? []}
        existingTitles={(existing ?? []).map((i) => i.title)}
      />
    </div>
  );
}
