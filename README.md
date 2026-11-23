# Lexora Academy

**English learning for Uzbek-speaking students and their teachers.**

[Live platform](https://lexora-academy-4zo.pages.dev/) · [Telegram Mini App](https://t.me/lexora_academy_bot?startapp=lexora) · [Changelog](CHANGELOG.md)

Built by **Kholhojayev Bekhruzbek ([uinezx](https://github.com/uinezx))**.

## Release 0.8.0

| Students | Teachers |
| --- | --- |
| Telegram registration and group-code joining | Multiple groups, dated lessons and decks |
| Uzbek → English flashcards, then vocabulary and spelling tests | Bilingual word imports and reversible archives |
| Lesson words unlock at a minimum **80%** score | Daily limits and explained redlist warnings |
| Adaptive daily revision with four recall grades | Individual freeze, warning reset and catch-up schedules |
| Assignments in the Mini App or bot chat | Assignment creation, written-answer review and editable AI drafts |
| Independent language practice | Attendance and lesson results |

### Practice spaces

- **Reading & Listening:** ten original starter exercises across A1–C1, level filters, answer explanations, timers and text scaling. Full Cambridge tests open at their external source.
- **Speaking:** six original models with grammar/vocabulary notes, question-only mode, audio and local recording.
- **Flashcards:** example audio, YouGlish context links, swipes and custom keyboard shortcuts.
- **Watch:** YouTube URL plus a pasted transcript, with word-level context lookup.

### Stack

JavaScript · HTML · CSS · Node.js · Cloudflare Pages / Workers · D1 / SQLite · Telegram Bot API · Workers AI

### Local development

Use Node.js 24 or later for the full test suite and built-in SQLite fixtures.

```sh
node scripts/build-worker.mjs
node scripts/preview-classroom.mjs
# Open http://127.0.0.1:4173
node --test tests/*.test.mjs
```

The preview includes local QA identities; those routes are never deployed. Set `LEXORA_PREVIEW_PORT` for another port.

### Deployment

Run `node scripts/prepare-cloudflare.mjs` to prepare `.sites-local/cloudflare/public`. Configure `DB`, encrypted `TELEGRAM_BOT_TOKEN`, owner `ADMIN_TELEGRAM_ID` and optional `AI` bindings in hosting settings. Apply migrations once, in order. See [hosting instructions](hosting/README.md).

### Project map

| Directory | Purpose |
| --- | --- |
| `dist/` | Frontend modules, styles and brand assets |
| `worker/` | Classroom API, revision and AI exercise drafts |
| `hosting/` | Telegram bot and Cloudflare entry |
| `scripts/` | Build, packaging and preview |
| `db/`, `drizzle/` | Schema and migrations |
| `tests/` | Behaviour and security checks |
| `server/` | Earlier Node prototype |

### Current boundaries

The scheduler is Anki-inspired, not FSRS. Audio uses device English text-to-speech. Speaking/Writing automated assessment, Google login, automatic subtitles and shared XP leaderboards are not connected. Practice answers, Watch transcripts and personal XP remain device-local; speaking recordings stay in the session unless downloaded. AI exercise drafts require teacher review, and real-provider conversion still needs acceptance testing.

**Validation:** 68 automated tests passed for 0.8.0.

Report reproducible bugs through [GitHub Issues](https://github.com/uinezx/lexora/issues). Keep tokens and student information out of reports and commits.

---

### v0.9 additions

Browser login pairs with the existing Telegram account through an explicit short-lived bot confirmation. Reading adds an original three-passage, 40-question practice test with evidence navigation. Speaking includes 28 original model answers with grammar notes, vocabulary, search and audio. These are practice materials, not calibrated IELTS band predictions.

### Speaking guide v0.10

212 topics from the user-authorized Jakhongir Isomiddinov guide: Part 1 (57), Part 2 (68), P2 Masters (19), Part 3 (68). Imported via visible artifact content; 654 numbered questions and 2249 text paragraphs. Grammar labels, model variants, preparation advice and examiner notes are retained. Source: https://claude.ai/artifact/3oAhhcbXcHSE2vr2QaLmkQ . The user confirmed republication permission in chat. Textual content is preserved; original inline lexical colour annotations and undo/redo annotation tools are not yet reproduced.
