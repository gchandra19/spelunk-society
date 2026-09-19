# Security policy

## Reporting a vulnerability

Please report security issues **privately**, not in a public issue.

Use GitHub's private reporting: go to the repository's **Security** tab and choose **Report a vulnerability**. Include what you found, how to reproduce it, and the impact you expect.

You can expect an acknowledgement within a few days. Please give us reasonable time to fix the problem before sharing details publicly.

## Scope

In scope: authentication and sessions, authorization (who can RSVP, host, review, or read messages), input handling, and data exposure.

Out of scope: volumetric denial-of-service against the hosting platform, and social engineering.

## Supported versions

Only the latest commit on `main` (the version deployed at https://spelunk-society.vercel.app) is supported.

## Handling secrets

Database credentials live only in environment variables (`DATABASE_URL`). If you believe a credential has been exposed, report it as above and rotate it in the Neon console.
