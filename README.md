# The Spelunkers Society

A community site for caving clubs: find expeditions, RSVP, host your own, and review the ones you joined.

**Live site:** https://spelunk-society.vercel.app

## Features

**Expeditions**
- Browse upcoming and past expeditions from clubs worldwide. Search by name, cave, country or club, and filter by difficulty (Beginner, Vertical, Rescue).
- One-tap RSVP with a live capacity bar. It never overbooks, even when several people grab the last spot at once.
- Add an expedition to your calendar (`.ics`) or share its link. Host your own and cancel it later.
- After an expedition ends, people who joined can leave a star rating and review.

**Questions & answers**
- Ask, answer and search. Mark answers helpful, and the asker can accept the one that solved it. Readable by everyone, no account needed.
- Every post shows the author's level, and admin-verified **Experts** get a badge.

**Gear guides**
- What to look for, what to avoid, standards, budget advice and where to get it, for 16 pieces of gear, with member reviews.
- Life-safety gear is flagged. Guides say **"Awaiting expert review"** until a named instructor is recorded (see [CONTRIBUTING.md](CONTRIBUTING.md)).

**Clubs**
- Clubs and grottos with member lists, meeting times, expeditions and ratings. Join or leave any club. Members and people who joined a club's expeditions can rate it.

**Members**
- Choose a level (Beginner, Intermediate, Vertical, Rescue). Sign in with email and password; if you forget it, reset it with the **recovery code** shown when you join (no email service needed).
- Contact form for questions and feedback.

## Quick start

Requires Node 20+ and a Postgres database ([Neon](https://neon.tech) free tier works).

```bash
npm install
cp .env.example .env.local     # add your DATABASE_URL
npm run db:migrate             # create the tables
npm run db:seed                # starter grottos and upcoming expeditions
npm run db:seed:demo           # optional: fictional members, clubs, expeditions, Q&A and reviews
npm run dev                    # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run build` / `npm start` | Production build and server |
| `npm run db:generate` | Create a migration after editing `lib/db/schema.ts` |
| `npm run db:migrate` | Apply migrations |
| `npm run db:test` | Business-logic checks against the database |
| `npm run e2e` | Browser test of the main flows (needs `npm run build && npm start` running) |
| `npm run make-admin -- you@example.com` | Grant admin (reads `/admin/messages`) |
| `npm run make-admin -- you@example.com expert` | Grant the verified-expert badge |
| `npm run db:unseed:demo` | Remove the demo content |

## Deploying

Import the repo in Vercel, set `DATABASE_URL` (Neon pooled connection string), and deploy. Run `npm run db:migrate` before deploying code that changes the schema. See [ARCHITECTURE.md](ARCHITECTURE.md) for details.

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md): stack, data model, how it works
- [CONTRIBUTING.md](CONTRIBUTING.md): how to contribute
- [SECURITY.md](SECURITY.md): reporting a vulnerability
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## License

[MIT](LICENSE). Photos come from Wikimedia Commons and are credited in the site footer.
