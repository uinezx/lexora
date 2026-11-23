## 0.12.0 — 2026-11-24

- Public landing page with a working flashcard preview, light/dark themes and the existing Telegram account pairing flow.
- Written vocabulary tests focus the answer field immediately and silently reject keyboard replacements when the browser identifies them. Ordinary typing and IME input remain supported; some mobile keyboards do not identify suggestions separately.
- Leaving an active test page marks the current unanswered question wrong once. Returning restores the feedback; keyboard focus changes do not incur a penalty.
- 82 automated tests passed, including input correction, focus, page exit and existing weekly competition scoring checks. Real mobile keyboard behavior still needs device testing.

## 0.11.0 — 2026-11-23

- Teacher vocabulary and lesson preview, with no changes to learner scores or SRS.
- Group owner can remove membership while retaining accounts and past submissions.
- Simple vocabulary start, collapsible word browser, weekly group competition.
- Server-derived XP: distinct daily review milestones and first successful lesson tests; no per-click XP.
- Back navigation, persistent light/dark theme, compact review and mobile layout.
- Watch: video without mandatory transcript, local file playback, SRT/VTT captions, timestamp jump, speed, pronunciation and personal bookmarks. Contextual word meanings use the existing AI binding with a 30-per-day account cap. Automatic subtitle retrieval remains unavailable.
- Removed external Engnovate shortcuts from native reading/listening libraries.
- Speaking questions expand independently; seven grammar explanations. All 212 topics now carry 10,630 exact original grammar/vocabulary highlight spans. Visible guide branding adapted to Lexora.

# Changes

## 0.8.0

- Added original A1–C1 independent Reading and Listening libraries, level filters, split reading/questions, short answers, explanations, timer pause, font scaling and local answer recovery. Full Cambridge tests open at their source. Listening uses device English text-to-speech.
- Added six original speaking models across A1–C1 with grammar/vocabulary notes, question-only mode, font scaling, example audio and the existing local recorder. No automated speaking or writing assessment.
- Added YouGlish context links and example-sentence audio to flashcard backs. Watch supports a user-supplied YouTube URL and pasted transcript, saved per account on this device; transcript words link to context lookup. No automatic subtitle extraction.
- Added server-backed custom Anki-inspired revision steps, per-group limits, reversible word/lesson archive, explained redlist, personal freeze/zero limit/warning reset and catch-up batches with partial lesson pass. This is not FSRS.
- Added teacher assignments, written-answer review and bot-chat submissions. Cloudflare AI creates editable exercise drafts from files; real provider output still needs owner acceptance testing.
- Production D1 migrations 0005–0007 were applied before this release; do not replay. AI binding was configured.
- 68 automated tests passed. No paid hosting plan enabled.


## 0.5.0

- Added teacher/student onboarding, admin approval, separate navigation, five-digit group invitations and multiple teacher-owned groups.
- Added group decks, atomic bilingual word imports, dated lessons, student rosters, performance and attendance.
- Require the entire lesson test to reach at least 80%, evaluated server-side without rounding up. Passing unlocks words in the selected deck for that student only; older unfinished lessons remain available.
- Removed automatically seeded vocabulary from new accounts. Existing personal browser data is retained separately.
- Added D1-backed classroom storage, a Sites Worker build and a separate Cloudflare Pages/Workers entry with verified Telegram authentication and protected sessions.
- Cloudflare Pages project: https://lexora-academy-4zo.pages.dev. First upload succeeded; database and Telegram configuration are tracked separately and must be verified before claiming full live functionality.
- 49 automated tests passed. Shared records are server-backed; personal SRS/XP, speaking recordings and device preferences remain local.

## 0.4.0

- Reworked vocabulary review into one flow: review cards, multiple-choice test, spelling test, results and retrying mistakes. Tests use the reviewed words rather than a random library sample.
- Added writing directly inside review cards, draggable cards and four-way grading with mouse, touch or pen pointer input.
- Added personalized grading and reveal keys, voice/accent/rate preferences, automatic pronunciation, motion preferences and optional 15/30-second or untimed test questions.
- Pronunciation explicitly selects an English voice and supports late voice loading. When unavailable, it resolves original dictionary recordings from Wikimedia Commons with author, source and license attribution.
- Kept review/test progress through refresh and blocked duplicate grading and repeat test XP for the same word within a session.
- Removed standalone spelling navigation; old spelling links explain the combined review/test flow.

## 0.3.0

- Applied the approved light student dashboard with coral accents and the new Lexora vector logo.
- Added a dedicated practice task page and consistent light styles for vocabulary, SRS, spelling, speaking, lessons, analytics, groups and settings.
- Connected the home dashboard to existing practice data: review queue, daily goal, streak, XP and word collections.
- Preserved the browser storage key and existing learning flows. Group membership and authentication remain explicitly marked as pending integration.
- Verified desktop and mobile layouts, the mobile menu and the review-to-dashboard update flow.

## 0.2.0

- Replaced neon colors, mascot banner and decorative cards with a graphite study workspace.
- Added coherent navigation icons, responsive menu with close and Escape support, and Uzbek calendar labels.
- Added local speaking practice with topic selection, a timer, recording, playback and download. Microphone streams close on navigation; audio is not uploaded.
- Import now previews new words and detects duplicates before saving.
- Study progress resumes after refreshing the same tab.
- Fixed empty-deck statistics and stale restore-confirmation controls.
- The production service still uses browser-local practice data. Teacher accounts, groups and Telegram authentication remain separate backend work, not live features of this release.

## 0.1.1

- Create a deck before adding its first word.
- Show Uzbek on the front and English on the back.
- Store and display optional IPA, part of speech, example translation, synonyms and collocations.
- Retry only the words answered incorrectly during spelling practice.
- Keep original design references in one asset directory.

## 0.1.0

First deployed learning MVP: vocabulary editing, paired import, simplified SM-2, spelling, activity statistics, mini lessons and backups.

AI, external login, cloud synchronization, Telegram, teacher/admin roles and global leaderboards are not active yet.
