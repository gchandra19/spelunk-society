# Architecture

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19, TypeScript (strict) |
| Styling | Tailwind CSS 3, Lucide icons, `next/font` (Inter, Fraunces) |
| Database | Neon serverless Postgres |
| ORM / migrations | Drizzle ORM, SQL migrations committed in `drizzle/` |
| Auth | Email + password (bcrypt), server-side sessions, recovery-code password reset |
| Validation | Zod (server), plus mirrored instant checks in the browser |
| Hosting | Vercel (functions + CDN) |

There is no separate API server. Pages are React Server Components, and mutations are Server Actions.

## Layout

```
app/            Routes (pages, one API route: /api/viewer)
components/     UI: domain/ (events, reviews), forms/, layout/, providers/
lib/
  db/           Drizzle schema and the Neon client
  services/     All database logic (no framework imports)
  actions/      Server Actions: auth, rate limit, validate, then call a service
  data/         Static content: photos, difficulty guidance, seed data
  session.ts    Cookie <-> session helpers
  validation.ts Zod schemas
scripts/        Seeding, integration test, browser e2e test, admin helper
drizzle/        Generated SQL migrations
```

The rule: **actions are thin, services hold the logic.** An action checks who you are, applies a rate limit, validates input, then calls a service. Services can be tested directly (`npm run db:test`) without a running server.

## Data model

```
users ──< sessions
  │
  ├──< rsvps >── events >── grottos (clubs)
  ├──< reviews >──┘            │
  ├──< grotto_reviews >────────┘
  ├──< questions ──< answers          helpful_votes (question or answer)
  └──< gear_reviews (keyed by gear slug; gear content lives in lib/data/gear.ts)
contact_messages, rate_limits (standalone)
```

Users carry a self-declared `skill_level` (beginner, intermediate, vertical, rescue) and a `role` (member, expert, admin). Only admins grant `expert`, which shows a "Verified expert" badge next to posts.

- `rsvps` has a composite primary key (event, user), so double RSVPs are impossible.
- `reviews` and `grotto_reviews` have a unique (target, user) index: one review each, editable.
- Rating and capacity ranges are enforced with database `CHECK` constraints, not just in code.

## Key mechanisms

**Caching without stale personal data.** Public pages (home, events, grottos) are cached at the CDN and revalidated every 60 to 300 seconds, and immediately after a relevant action. Personal state ("am I going?") can't live in a cached page, so a small client provider (`ViewerProvider`) fetches `/api/viewer` after load. That endpoint does no database work for signed-out visitors.

**Overbooking is impossible.** An RSVP runs in a transaction that locks the event row, counts current RSVPs, and only then inserts. The UI updates optimistically (`useOptimistic`) and rolls back with a message if the server refuses.

**Sessions.** Signing in creates a random 256-bit token. The cookie holds the token (httpOnly, SameSite=Lax, Secure in production); the database stores only its SHA-256 hash, so a database leak does not yield usable sessions. Sign-in always runs a password comparison, even for unknown emails, and returns one generic error.

**Password recovery without email.** Sign-up shows a random 16-character recovery code once (80 bits). Only its SHA-256 hash is stored. Resetting a password needs the email plus the code; it is single-use (rotated on every reset), revokes all sessions, is rate-limited per account and per IP, and gives the same error for a wrong email or a wrong code. Existing accounts generate a code from `/account` after confirming their password. Trade-off: lose both password and code and you must contact the admins.

**Expert content.** Gear guides are curated data (`lib/data/gear.ts`). A guide shows "Expert reviewed by NAME on DATE" only when the `review` field is set, otherwise "Awaiting expert review". Nothing claims a review that hasn't happened.

**Q&A rules.** You can't mark your own post helpful, one answer per person per question, only the asker can accept an answer, and helpful votes are one per person. Enforced in `lib/services/qa.ts`.

**Review integrity.** The server, not the UI, decides who may review: an event review needs an RSVP and a finished event; a grotto rating needs membership or a past joined expedition.

## Abuse protection

- Every Server Action is a public endpoint, so each one checks the session, validates input with Zod, and applies a rate limit.
- Rate limiting is a Postgres upsert (`lib/services/rate-limit.ts`), keyed per user or per IP. No extra service to run.
- The contact form has a honeypot field. Redirect targets after sign-in are restricted to same-site paths.
- Security headers (frame denial, `nosniff`, HSTS, referrer and permissions policies) are set in `next.config.mjs`.
- Vercel absorbs network-level floods; cached pages keep most traffic away from the database.

## Testing

- `npm run db:test`: service-level checks against a real database, including a concurrency test for the capacity limit.
- `npm run e2e`: a real browser (Playwright driving Edge) through sign-up, RSVP, hosting, cancelling, sign-out and sign-in.
- CI runs the type-check on every pull request.

## Deployment

1. Vercel builds with `next build` and needs `DATABASE_URL`.
2. Migrations are applied manually (`npm run db:migrate`) before deploying code that needs them. Changes are additive first, so the previous deployment keeps working during the switch.
3. `ws` and `@neondatabase/serverless` are listed under `serverExternalPackages` so the WebSocket driver is not mangled by the bundler.

## Known limitations

- No email verification, and password reset relies on a recovery code because sending email needs a verified domain.
- Cover photos are chosen from a bundled set; there are no uploads.
- Times are shown in UTC.
- Contact messages are stored in the database and read at `/admin/messages` by admin accounts.
