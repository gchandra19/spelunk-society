# The Spelunkers Society

A community site for caving clubs: find expeditions, RSVP, host your own, and review the ones you joined.

**Live site:** https://spelunk-society.vercel.app

## Features

**Expeditions**
- Browse upcoming and past expeditions. Search, and filter by difficulty (Beginner, Vertical, Rescue).
- Each expedition shows the cave, date and time (UTC), duration, host grotto, what to expect and what to bring.
- One-tap RSVP with a live capacity bar. The count updates instantly and never overbooks, even when several people grab the last spot at once.
- Add an expedition to your calendar (`.ics`) or share its link.
- **Host your own:** any member can publish an expedition with a cover photo, capacity and difficulty, and cancel it later.
- **My Expeditions:** everything you're going to or hosting.

**Reviews and ratings**
- After an expedition ends, people who joined it can leave a star rating and a written review. One review each, editable.
- Members of a grotto, and people who joined its expeditions, can rate the grotto.

**Community**
- Member accounts (email and password) with optional grotto membership.
- Grotto directory with member counts, meeting times and ratings.
- Contact form for questions and feedback.

## Quick start

Requires Node 20+ and a Postgres database ([Neon](https://neon.tech) free tier works).

```bash
npm install
cp .env.example .env.local     # add your DATABASE_URL
npm run db:migrate             # create the tables
npm run db:seed                # starter grottos and upcoming expeditions
npm run db:seed:demo           # optional: fictional members, past expeditions and reviews
npm run dev                    # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run build` / `npm start` | Production build and server |
| `npm run db:generate` | Create a migration after editing `lib/db/schema.ts` |
| `npm run db:migrate` | Apply migrations |
| `npm run db:test` | Business-logic checks against the database |
| `npm run e2e` | Browser test of the main flows (needs `npm run build && npm start` running) |
| `npm run make-admin -- you@example.com` | Grant an account access to `/admin/messages` |
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
