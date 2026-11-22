# Hosting Lexora

## Cloudflare Pages

Run `node scripts/prepare-cloudflare.mjs`. Upload the contents of `.sites-local/cloudflare/public` to a Pages project in advanced Worker mode.

Configure the following bindings in the hosting dashboard:

- `DB`: Cloudflare D1 database.
- `TELEGRAM_BOT_TOKEN`: encrypted secret from BotFather.
- `ADMIN_TELEGRAM_ID`: the owner's numeric Telegram ID.
- `AI`: optional Workers AI binding for editable exercise drafts.

Apply SQL migrations in `drizzle/` once, in order. Record applied versions before changing deployment tools. Never replay CREATE/ALTER migrations already applied to an existing database.

Set the bot's Main Mini App and menu URL to the deployed HTTPS origin. Open the application through Telegram. Teachers need administrator approval; students join with a valid group code.

## Authentication and data

The direct entry is `cloudflare-worker.js`. Incoming identity headers are stripped. Telegram Mini App signatures, timestamps and session cookies are verified server-side. Bot updates require the configured webhook secret.

Bot chat onboarding validates that a shared contact belongs to its sender. A unique keyed phone digest prevents the same phone being linked twice. Raw phone numbers are not stored. Bot token rotation requires a phone-verification migration because the digest depends on that key.

Accounts, groups, lessons, tests, revision schedules, assignment submissions and attendance are shared server records. Personal XP, preferences, independent-practice answers and Watch transcripts remain device-local. Speaking recordings stay in the session unless downloaded.

## Preview and alternative entry

`node scripts/build-worker.mjs` prepares the Sites-compatible Worker. Sites identity headers are trusted only behind that hosting environment. The earlier `server/` directory is a separate Node prototype.

`node scripts/preview-classroom.mjs` provides loopback-only QA identities and SQLite fixtures. Those routes are never bundled into production.

## Current limits

Google login and English-only vocabulary generation are not connected. AI exercise drafts require teacher review; real-provider file conversion still needs acceptance testing. Listening uses device English text-to-speech. No paid plan is enabled by this code, but provider quotas and account configuration still apply.
