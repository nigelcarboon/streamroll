# StreamRoll 🎞️
*Your streaming rotation, planned in advance.*

## The problem

The average household juggles 6+ streaming subscriptions and, per multiple industry surveys, forgets or underuses roughly half of them each month. Existing "subscription manager" apps are reactive: pause something when you remember to, restart when something drops. Nobody's watchlist actually reflects this. Even highly organised people end up with a sprawling, unstructured list of shows with no clear sense of where anything lives or when to watch it.

## The idea

StreamRoll is a companion app that plans your streaming rotation ahead of time, one paid service active per month, and matches your watchlist against that plan. You always know what's live now, what's coming, and exactly when to switch.

## How it works

1. **Roster** — build a rotation calendar (Aug: Netflix, Sep: Stan, Oct: Disney+...), either self-arranged or auto-suggested
2. **Watchlist** — add shows via search or bulk paste; StreamRoll matches each title to a service and tells you when it's due, or if it's free right now
3. **Reminder** — a nudge before your billing cycle turns over, with a one-tap link to cancel and resubscribe yourself

No linked bank accounts. No stored credentials. StreamRoll never touches money, it just tells you what to do and when.

## Why this, and why now

- **Existing players are reactive, not planned.** StreamWolf and Toggle both frame the mechanic as "pause when you feel like it." StreamRoll's planned annual roster, matched against a real watchlist, is a genuinely different mental model.
- **Concierge cancellation tools carry real weight.** Rocket Money, Trim, and similar link financial accounts and take on real security and compliance liability to cancel on your behalf. StreamRoll sidesteps that entirely in v1.
- **The regulatory wind is more than a tailwind in Australia, it's now law.** The Competition and Consumer Amendment (Unfair Trading Practices) Bill 2026 passed Parliament on 2 July 2026 and commences 1 July 2027. It bans subscription traps and requires cancellation to be as easy as sign-up, including online cancellation for anything signed up online. That timeline lines up well with a real build and launch, and it directly de-risks the one-tap cancel link at the heart of the reminder screen.

## The free tier

ABC iview, SBS On Demand, and 10 Play don't need a rotation slot, there's nothing to cancel. Instead, they're tracked inside the watchlist matching engine as **always free**, so the app stays genuinely useful even outside your paid rotation months. It also means StreamRoll never has an incentive to hide the free option in favour of a paid one.

## Smart-paste import

Real-world testing (a 300+ title personal watchlist, mid-build) showed the core onboarding problem isn't "type in what you've got", it's "let people paste in the mess they already have." A significant share of any real watchlist has no platform tag at all. Matching pasted or freeform lists against a proper content database (TMDB-style) is core to the MVP, not a nice-to-have.

## Business model

A small monthly or annual subscription ($3–6 AUD range, to be tested). No revenue share dependency on streaming platforms, no financial account linking, no concierge labour costs.

## MVP scope (v1)

- Manual service selection and roster builder
- Watchlist with search + smart-paste import
- Free-tier matching (iview, SBS, 10 Play)
- Push reminders with deep links to cancel/resubscribe
- Mark-as-watched toggle per title, so the queue always reflects what's actually left to watch and quietly builds a personal viewing history
- Stretch: custom mood/genre tags (e.g. "queer film," "movie night"), surfaced directly from real user behaviour

## Beyond v1

- **Fast follow:** voice capture via Siri Shortcuts / App Intents ("Hey Siri, add Ted Lasso to my watchlist"), removing the friction that turns watchlists into chaos in the first place
- **Fast follow:** native share sheet integration ("Just watched X on Y via StreamRoll") for Threads, Facebook, and elsewhere, low build cost and doubles as organic marketing
- **Fast follow:** CSV export of watched films in Letterboxd's diary-import format. A live API sync isn't realistic, Letterboxd's API is approval-only, excludes personal projects, and doesn't cover TV, but an export-and-import path needs no third-party approval
- **v2:** optional concierge "cancel for you" tier, once trust and volume justify the compliance lift
- **v3:** direct platform partnerships, turning churn into product
- **Later still:** watched history feeds a smarter auto-arranging roster, prioritising services with unwatched backlog

## Open questions to resolve next

- Content database choice and licensing (TMDB, JustWatch-style data, or similar)
- Launch region: Australia first, given the free-to-air landscape is well understood from this research
- Whether the "planned rotation matched to a watchlist" mechanism is meaningfully patentable, or whether the moat is really execution and brand
