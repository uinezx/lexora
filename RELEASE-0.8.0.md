# Lexora 0.8.0 deployment — 2026-11-21

Production: https://lexora-academy-4zo.pages.dev/
Cloudflare dashboard returned Success for production upload of lexora-cloudflare-v08.zip (21 files).
Live HTTP checks: practice-library.js, practice-studio.js, watch.js all 200; /api/classroom/me correctly 401 outside Telegram.
D1 migrations 0005–0007 were already applied. Do not replay them.
AI binding configured earlier; real provider file conversion remains unverified with the owner account.
68 automated tests pass. Browser checks: Reading 3/3 with explanations, speaking sample/grammar notes, mobile library, personal freeze save/resume. Local preview identities only.

Current limitations:
- A1–C1 starter library: 5 reading + 5 listening exercises, six original speaking models.
- Full Cambridge tests open on Engnovate, not copied or imported into Lexora.
- Listening/model audio uses device English TTS. No recorded listening corpus.
- Watch uses YouTube URL and pasted transcript, device-local. No automatic subtitles or synchronised transcript timestamps.
- Speaking/writing AI assessment deferred as requested. Existing writing is still an IELTS draft exercise.
- Custom Anki-inspired scheduler, not FSRS. Personal XP remains device-local.
- Source publication to GitHub is tracked separately from the November 21 hosting deployment. Deployment packages remain local; user records and secrets are excluded from source publication.
