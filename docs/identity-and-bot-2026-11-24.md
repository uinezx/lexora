# Lexora identity and Telegram setup

Selected identity: folded L, forest #193028, cream #F3F0E8, coral #DF7957. Original mark with outlined Albert Sans lettering (license in dist/assets/Albert-Sans-OFL.txt). Dark/light wordmarks are used in the landing header/footer and cabinet; the coral icon is the favicon, and the matching avatar is available as PNG and JPG.

Telegram profile is applied by a fixed versioned bootstrap at GET /api/bot/branding on the canonical production origin. It uses only the existing encrypted TELEGRAM_BOT_TOKEN binding, verifies the expected lexora_academy_bot username before changing anything, and accepts no caller-supplied configuration. No token or Telegram API response is returned to callers. Existing telegram_bot_config storage records ready/failed status; failures are throttled for a minute and successful configuration runs once per version. The route returns only configuration status.

Profile: Lexora | Ingliz tili, Uzbek/default short and long descriptions, private-chat start/open/tasks/help/cancel commands, a fixed Mini App menu button and the selected profile photo. No user messages are broadcast and existing account, phone verification and browser-pairing rules remain in force. Help/open preserve onboarding state; cancel clears unfinished work and browser pairing without deleting accounts or results.

Verification: 86 automated tests pass, including profile destination guard, once-only setup, upload format, failure throttle, onboarding preservation and cancellation. Generated Cloudflare worker syntax checked. Browser inspected at normal desktop size and 320×780; light/dark wordmarks load, mobile navigation fits without document overflow, and the teacher cabinet uses the new wordmark. No database migration.
