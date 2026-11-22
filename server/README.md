# Lexora API — local backend milestone

This is a Node.js + SQLite API, independent of the existing static Sites deployment. Node.js 24 is required for the tested `node:sqlite` runtime. No package installation is needed.

```sh
node server/start.mjs
# GET http://127.0.0.1:4174/api/health
node --test tests/*.test.mjs
```

The API binds to loopback. For a real release it needs a Node hosting service with a persistent volume, HTTPS reverse proxy and the frontend on the same public origin. The existing static Sites manifest must not be used to claim this Node service is deployed.

## Runtime configuration

Set these using the host's secrets/environment editor; do not put values in source or chat:

- `TELEGRAM_BOT_TOKEN`: BotFather token for `@lexora_academy_bot`.
- `ADMIN_TELEGRAM_ID`: the owner's Telegram numeric ID, checked only against signed Telegram identity. New accounts cannot choose their role.
- `PUBLIC_ORIGIN`: the exact HTTPS frontend/API origin.
- `LEXORA_DB`: absolute database path on a persistent volume.
- `PORT`: local application port, default 4174.

For local configuration Node supports `node --env-file=.env.local server/start.mjs`. `.env*`, `data/` and SQLite files are ignored by Git. Never use a real token in test fixtures.

## Implemented endpoints

| Method | Route | Access |
|---|---|---|
| GET | `/api/health` | Configuration status only |
| POST | `/api/auth/telegram` | Signed, fresh Mini App initData; one-time exchange |
| GET | `/api/me` | Current server session |
| POST | `/api/logout` | Current server session |
| POST | `/api/teacher/apply` | Active student; becomes a pending teacher applicant |
| GET | `/api/admin/teachers` | Active admin |
| POST | `/api/admin/teachers/:id/approve` | Active admin |
| GET/POST | `/api/groups` | Own memberships / approved teacher creation |
| POST | `/api/groups/join` | Active student, valid group code |
| GET/POST | `/api/groups/:id/words` | Active member read / owning teacher write |

Mutation requests require the exact Origin header and JSON content type. Sessions are HttpOnly, SameSite cookies, Secure on HTTPS. All accesses reread the current account role and status. Database queries use bound parameters. There is a basic per-process request limit; production must also have ingress-level limits. Group join codes are unique five-digit invitation codes, not passwords.

## Not complete yet

- Telegram bot `/start` and Mini App menu configuration.
- Frontend integration and migration from browser-local vocabulary.
- Production hosting, backups and monitoring.
- Google login, account linking and recovery.
- Task submission APIs and transactional XP ledger integration.
- Speaking audio upload/storage and teacher review screens.

The backend must not be called a production-ready platform until these integration steps are completed and tested with the real bot.

References: [Telegram initData verification](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app), [Node SQLite](https://nodejs.org/api/sqlite.html).
