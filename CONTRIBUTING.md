# Contributing

Thanks for helping. Bug reports, fixes, and ideas are all welcome.

## Getting set up

Follow **Quick start** in the [README](README.md). Use your own free Neon database (or a Neon branch), never a shared or production one.

## Making a change

1. Open an issue first for anything larger than a small fix, so we can agree on the approach.
2. Fork, then create a branch: `git checkout -b fix/short-description`.
3. Keep changes focused. One concern per pull request.
4. Before you push:
   ```bash
   npx tsc --noEmit     # must pass
   npm run db:test      # if you touched lib/services or the schema
   npm run build && npm start   # then: npm run e2e, if you touched a user flow
   ```
5. Open a pull request and fill in the template.

## Guidelines

- **Logic goes in `lib/services/`, not in actions or components.** Actions stay thin: auth, rate limit, validate, call a service. See [ARCHITECTURE.md](ARCHITECTURE.md).
- **Every Server Action is a public endpoint.** Check the session, validate input, and rate-limit.
- **Schema changes** go through `npm run db:generate`. Commit the generated SQL in `drizzle/`. Prefer additive changes.
- Never commit secrets. `.env.local` is git-ignored; `.env.example` shows the shape.
- Photos must be openly licensed (public domain or CC) and credited in `lib/data/photos.ts`.
- Keep the UI accessible: labels on inputs, visible focus, meaningful alt text.

## Expert review of gear guides

Gear guides live in `lib/data/gear.ts`. When a qualified caving instructor has checked a guide, record them on that item:

```ts
review: { by: "Jane Smith, cave instructor (BCA)", on: "2026-11-02" }
```

Only add this once the review has really happened. Until then the site shows "Awaiting expert review". Grant a member the **Expert** badge with `npm run make-admin -- their@email expert`.

## Reporting security issues

Please don't open a public issue. See [SECURITY.md](SECURITY.md).

## Conduct

By taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
