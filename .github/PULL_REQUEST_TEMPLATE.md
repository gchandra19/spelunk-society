## What and why

<!-- What does this change, and what problem does it solve? Link the issue: Closes #123 -->

## How I tested it

- [ ] `npx tsc --noEmit`
- [ ] `npm run db:test` (if services or schema changed)
- [ ] `npm run e2e` (if a user flow changed)

## Checklist

- [ ] Logic is in `lib/services/`, actions stay thin
- [ ] New Server Actions check the session, validate input, and rate-limit
- [ ] Schema changes include a generated migration
- [ ] No secrets committed
