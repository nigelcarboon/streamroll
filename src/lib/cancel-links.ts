/**
 * Where to manage or cancel each paid service on the web, keyed by the
 * service name in the `services` table. These are the services' own
 * account pages. streamroll. never cancels anything itself, it only
 * points the way. Anyone billed through Apple, Google Play or a telco
 * has to cancel with that provider instead.
 */
export const CANCEL_LINKS: Record<string, { url: string; path: string }> = {
  Netflix: {
    url: "https://www.netflix.com/account",
    path: "Account, then Cancel membership",
  },
  Stan: {
    url: "https://my.stan.com.au",
    path: "Subscription information, then Cancel your subscription",
  },
  "Disney+": {
    url: "https://www.disneyplus.com/account",
    path: "Account, your subscription, then Cancel subscription",
  },
  "Prime Video": {
    url: "https://www.amazon.com.au/prime",
    path: "Manage membership, then End membership",
  },
  "Apple TV+": {
    url: "https://tv.apple.com",
    path: "Account icon, Settings, Subscriptions, then Manage",
  },
  "HBO Max": {
    url: "https://help.hbomax.com/AU/Answer/Detail/000002526",
    path: "Profile, Subscription, then Cancel your subscription",
  },
  Binge: {
    url: "https://binge.com.au",
    path: "My account, Subscription & billing, then Cancel subscription",
  },
  "Paramount+": {
    url: "https://www.paramountplus.com/account",
    path: "Account, then Cancel subscription",
  },
};
