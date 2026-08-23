# StreamRoll — lean prototype scope

**Goal:** a genuinely working version of the three-screen loop, good enough to put in front of real people (a first batch from your podcast audience is a solid test group), before spending anything on native app builds, content licensing, or a business entity.

## Platform choice

Web app first, not native. A browser-based build (installable as a home-screen PWA) skips App Store review, works for testers on any phone with a link, and is far faster to iterate on. Native iOS/Android is a "once we know people want this" decision, not a v1 one.

## The four screens

1. **Onboarding** — pick your services from the list (Netflix, Stan, Disney+, Prime Video, Apple TV+, HBO Max, Binge, Paramount+, plus the free tier)  
2. **Roster** — manual monthly rotation calendar. Auto-arranging the roster around the watchlist is a real feature, but it's v2, not v1  
3. **Watchlist** — search-and-add, smart-paste import, mark-as-watched toggle  
4. **Reminder** — in-app banner plus email a few days out from a rotation change. Native push needs a real app, so email is the lean stand-in

## Data model (rough)

- `User` — id, email, region  
- `Service` — id, name, colour, is\_free  
- `RosterSlot` — user\_id, service\_id, month, year  
- `WatchlistItem` — user\_id, title, tmdb\_id, matched\_service\_id (nullable), status (unwatched/watched), source (manual/paste), added\_at  
- `ReminderLog` — user\_id, sent\_at, service\_id

## Content matching

TMDB's Watch Providers API (powered by JustWatch, free, region-filterable) covers both movies and TV and is the natural backbone for matching a title to "which service is this on in Australia right now." Worth flagging early: coverage for the smaller free-to-air platforms (7plus, 9Now, 10 Play) tends to be patchier than the big paid ones, so a manual override on the watchlist item stays necessary as a fallback, exactly the gap your own list showed.

## Suggested stack

- **Frontend:** React  
- **Backend/data:** a small hosted backend (something like Supabase) for auth and the database, rather than pure local storage, so testers' lists persist across sessions and devices  
- **Email:** any transactional email service for the reminder, this is the whole notification system for v1  
- **Hosting:** Vercel or Netlify, free tier is plenty for a tester group

## Explicitly out of scope for this pass

- No financial or account linking, ever, in this model  
- No live "cancel it for you" automation  
- No Letterboxd export or social share, both fast-follows  
- No auto-arranging roster  
- No native app / App Store presence  
- No Siri Shortcuts (needs a native app or a URL-scheme workaround, worth a look later, not core)

## Rough build order

1. Data model and backend setup  
2. Onboarding and service selection  
3. Roster screen (manual calendar)  
4. Watchlist screen (search via TMDB, manual add)  
5. Matching logic, title to service to status  
6. Reminder logic (date check plus email)  
7. Smart-paste import (parse a pasted block, match each line against TMDB), the most complex piece, likely last  
8. Visual polish, matching the style already approved in the mockup

## Testing plan

Hand it to a handful of real people, ideally with real, messy watchlists like yours, and watch whether the smart-paste import actually copes with the chaos. That's the single most important thing to learn before deciding whether this becomes a full app.  
