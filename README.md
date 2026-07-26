# F1 Stats Hub

A Next.js app for following a Formula 1 season and collecting the drivers in it. Every standing, result and race time on the site is pulled live from public F1 APIs (nothing is seeded or hardcoded), and on top of that sits a little card game where reading the stats is what earns you the coins to open packs.

![Comparing two drivers](docs/compare.png)

*Hamilton against Verstappen. The two hero cards take their colours from the drivers' constructors, and every number on the bars is fetched at selection time. Career entries, wins, podiums and poles each come from a separate count query against the results endpoint.*

## Features

- **Live season dashboard.** Driver and constructor standings, plus a countdown to the next race over the circuit's own photograph, with the round number and local start time.
- **Full race results** for any round of any season back to 1950, with gaps to the winner, points, and podium positions picked out.
- **Driver profiles** themed in the driver's team colours: career totals, permanent number, nationality, and a round-by-round table of the selected season with retirements marked.
- **Head-to-head comparison** with autocomplete search on both sides, proportional stat bars, and a season selector that recomputes points, average finish, best finish and the H2H record.
- **A card collection game.** 22 driver cards across four rarities, weighted pack odds, duplicate counting, and selling back at a rarity-based price.
- **Coins earned by browsing:** daily login, first visit to each stats page, first visit to each driver profile. All once per day, all enforced server-side against a points ledger.
- **Accounts** with credentials auth, bcrypt-hashed passwords and JWT sessions via NextAuth v5.

![Dashboard](docs/dashboard.png)

*The dashboard. The next-race card matches the Jolpica schedule entry to an OpenF1 meeting so it can show the right flag and circuit image, and the standings below are the top five of each table.*

## How it works

The app is Next.js App Router with **server components doing the fetching**. Pages like the dashboard, standings and results are async server components that `await` the API layer directly. There's no client-side loading state for the data itself, and no API routes proxying it. Only the interactive pieces (comparison, schedule filtering, pack opening, collection) are client components, and they get their initial data as props.

### Data layer

`app/lib/api.ts` is the single place that talks to the outside world. Everything else imports typed functions from it.

| Source | Used for |
| --- | --- |
| [Jolpica](https://api.jolpi.ca/ergast/f1) (Ergast successor) | Standings, schedules, race results, per-driver results, career counts |
| [OpenF1](https://api.openf1.org/v1) | Meeting metadata, matched to Jolpica races for country and circuit identification |

Two details do most of the work there:

- **Retry with exponential backoff.** Jolpica rate-limits aggressively. `fetchJson` retries a 429 up to three times at 600 ms, 1.2 s and 2.4 s, and it tells a network failure (retry) apart from a real `ApiError` like a 404 (throw immediately).
- **Five-minute revalidation.** Every request goes through Next's `revalidate: 300`, so refreshing a page during a race weekend doesn't turn into twenty upstream calls.

Career stats need five separate count queries (total entries, then wins, seconds, thirds, and pole positions) because the API exposes them as filtered result sets rather than a summary. They're issued one at a time with a 200 ms gap instead of in parallel, and that's deliberate: firing all five at once reliably trips the rate limiter. If the batch fails anyway, the profile just renders `--` instead of breaking.

![Race results](docs/results.png)

*Results for any round. The season and round come from the URL, so a result page is linkable.*

### The card game

Coins are the link between the two halves of the site. You earn them by reading statistics and spend them on packs.

| Action | Reward | Limit |
| --- | --- | --- |
| New account | 100 | once |
| Daily login | 10 | once per day |
| Viewing a stats page | 5 | once per page per day |
| Viewing a driver profile | 3 | once per driver per day |
| Opening a pack | -50 | every time |

Every award is written to a `PointsLog` row alongside the balance update, inside a Prisma transaction. The daily limits are then enforced by asking that ledger whether a row with the same reason exists since midnight. So the client can't grant itself anything by replaying a request, and the page names it may claim for are checked against an allowlist rather than trusted.

Packs roll a rarity first and then a card from that rarity's pool, so adding a driver doesn't quietly change anyone else's odds:

| Rarity | Pack odds | Sell price |
| --- | --- | --- |
| Legendary | 2% | 250 |
| Epic | 8% | 100 |
| Rare | 25% | 50 |
| Common | 65% | 25 |

Rarity is resolved from the card definition at read time rather than trusted from the stored row, so rebalancing a driver's rarity updates every copy already collected, sell price included.

![Driver profile](docs/driver-profile.png)

*A driver profile, themed from the constructor. Visiting one pays 3 coins the first time each day.*

### Data model

Prisma against PostgreSQL. The NextAuth tables (`User`, `Account`, `Session`, `VerificationToken`) come from the Prisma adapter, and `CollectedCard` and `PointsLog` are the game.

`PointsLog` is indexed on `[userId, reason, createdAt]` precisely because the daily-limit check queries on all three, and it runs on every page navigation.

## Getting started

```bash
git clone https://github.com/denzlswaggin/f1-stats.git
cd f1-stats
npm install
```

Create `.env` with a database and an auth secret:

```
DATABASE_URL="postgresql://user:password@localhost:5432/f1_stats"
AUTH_SECRET="generate with: npx auth secret"
```

Then push the schema and start:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

The app runs on <http://localhost:3000>. There's no seeding step: the F1 data arrives from the APIs on first render, and the card pool is defined in code.

### Docker

```bash
docker compose up --build
```

Reads the same `.env`, builds the app and exposes port 3000. Bring your own PostgreSQL and point `DATABASE_URL` at it.

### Layout

```
app/              routes; server components fetch, *Client.tsx files are interactive
app/lib/api.ts    every external API call, typed in app/lib/types.ts
app/actions/      server actions: coins, packs, selling, auth
prisma/           schema
context/          collection and coin balance, shared across the client tree
public/drivers/   driver portraits (.avif) and signature card art (.png)
public/tracks/    circuit photography for the next-race card
docs/             screenshots used in this README
cypress/e2e/      end-to-end specs
```

### Tests

```bash
npm run dev          # in one terminal
npx cypress open     # or: npx cypress run
```

54 end-to-end tests across seven specs, covering the dashboard, both standings tables, the schedule, driver search and profiles, the pack flow, and navigation between all of them. They run against a live dev server and live API data, so a failure can just mean the upstream API is rate-limiting rather than the app being broken. Worth checking that before you go chasing it.

## A note on the data

Standings, results and schedules are whatever Jolpica returns, and Jolpica mirrors the official timing with a delay. This isn't a live-timing app, so a session in progress won't update lap by lap. Career totals are counted from result rows, which means a driver's totals are only as complete as the Ergast/Jolpica archive for their era. The card rarities are mine, not a rating. They exist to make packs interesting, and they say nothing about how quick anyone actually is.

Driver portraits and team marks belong to their respective owners and are used here for a non-commercial school project.
