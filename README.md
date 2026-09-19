
# 🦇 The Spelunkers Society (Grotto Hub)

Welcome to **The Spelunkers Society**, a lightweight, serverless community bulletin board designed specifically for caving clubs, expeditions, and training organizations. 

This is a personal hobby project built to explore full-stack development, serverless architectures, and next-generation autonomous AI workflows.

## 🚀 MVP Features
- **Event Feed:** A public bulletin board tracking upcoming cave cleanups, vertical training days, and club meetings.
- **Organization Profiles:** Basic landing pages for local caving groups ("Grottos") to share details.
- **RSVP Tracker:** Simple interactive tracking for team leaders to see attendance counts before an event.

## 🛠️ Tech Stack & Architecture
- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS (with Lucide React icons)
- **Database:** Neon Postgres via Drizzle ORM (schema in `lib/db/schema.ts`, migrations in `drizzle/`)
- **Auth:** Email + password with hashed sessions (`lib/session.ts`, `lib/services/users.ts`)
- **Hosting:** Vercel
- **Development Tool:** Claude Code (Autonomous CLI Agent workflow)

## 💻 Local development
```bash
npm install
cp .env.example .env.local     # then paste your Neon connection string
npm run db:migrate             # create tables
npm run db:seed                # starter grottos and events
npm run dev
```
Other scripts: `npm run db:generate` (after editing the schema), `npm run db:test` (service checks against the database), `npm run e2e` (browser test; needs `npm run build && npm start` running).

## ☁️ Deploying to Vercel
1. Push to GitHub and import the repo in Vercel.
2. Add the environment variable `DATABASE_URL` (your Neon **pooled** connection string) for Production and Preview.
3. Deploy. Run `npm run db:migrate` whenever the schema changes, before deploying the code that needs it.

Use a separate Neon branch for Preview deployments so pull requests never touch production data.

---
*Note: This project is a sandboxed personal development environment built completely without a local host footprint.*
