# Lexora

Gamified English vocabulary learning for Uzbek speakers. Based on the project owner's Stitch references and working prototypes.

## Current version: 0.1 — learning MVP

- Responsive dark purple / cyan interface.
- Uzbek on the front of the flashcard, English on the back.
- Decks, search, word creation, editing and deletion.
- Bulk import of word / translation / optional example rows (semicolon, TSV, spaced dash or equals).
- Simplified SM-2 scheduling with Again / Hard / Good / Easy. This implementation is **not FSRS**.
- Spelling practice with immediate feedback, XP, streaks and activity statistics.
- Three introductory lessons with quizzes.
- JSON backup export and restore.
- Original Stitch screen reference gallery.

Data is stored only in this browser's localStorage in v0.1. There is no account system or cross-device sync yet. AI generation, Telegram integration, teacher/admin management and global rankings are planned, not connected services.

## Run

Node.js 22 or newer; no package installation required.

```sh
node server.mjs
# Open http://127.0.0.1:4173
node --test tests/engine.test.mjs
```

Static hosting serves the `dist` directory. `.openai/hosting.json` records the existing Sites project identity; do not create a replacement Site for later updates.

## Planned releases

See [ROADMAP.md](ROADMAP.md) for the section-by-section product scope and open decisions.

1. v0.1: reviewable learning flow and design.
2. v0.2: account sign-in, durable user-owned vocabulary and progress; migration from local backup.
3. v0.3: server-side AI word processing with a review queue and quotas.
4. v0.4: Telegram Mini App and opt-in reminders.
5. v0.5: teacher / student groups, courses, games, rankings and admin controls.

Each release should have separate validation and deployment. An open-source repository does not make user data public. Future server APIs must enforce ownership on every read and write.

## Source boundaries

Only application code and design references belong in the repository. User videos, Telegram screenshots, application forms, credentials and local study backups must not be committed.
