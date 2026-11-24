# Landing reference study — 24 November 2026

Scope: public marketing page only. Logged-in classroom and test behavior are unchanged.

Reviewed chronological contact sheets spanning each supplied clip; these are visual samples, not a full audio transcription or a claim to have inspected every video frame. Source files and frames remain outside the published application.

| Clip | Observed evidence | Application to Lexora |
| --- | --- | --- |
| 10 out of 10 | 3–6s: product hero and strong display typography; 6–14s: shader, halftone and orbital demonstrations | A locally drawn, dimensional word orbit, with visible educational content rather than an unrelated object. |
| outdated claude | 3s: globe-led opening; 4–11s: scroll carries shipping objects between differently composed chapters | A continuous sticky learning sequence switches between recall, speaking and context. No shipping/globe branding borrowed. |
| so freaking cool | 0–8s: bean, pouring coffee, filter and cup change with scroll; one coherent material palette throughout | Content-led scene changes and consistent cream, coral and ink surfaces. No coffee assets or imagery copied. |
| portfolio / SaveVid AQPbx | 0–10s: strong scale changes and light/dark contrast; 15–22s: spatial gallery and curved presentation; 27s: strong closing type | Full-screen typographic statement, depth in the learning preview, and a large editorial close. |
| do not let | 7s: generic purple hero presented as a negative; 10–36s: GSAP, Lenis, React Bits and 21st.dev examples | Authored motion with a real subject. Native scrolling retained; no scroll hijacking or dependency added just for appearance. |
| real | 17–44s: Emil, Impeccable and Taste skill examples emphasize motion, detail and art direction | Pause control, reduced-motion fallback, intentional hierarchy, pointer response confined to the scene. |
| SaveVid AQMm | 0–17s: three design skills and generic-page criticism; 22–61s: real layout refinement and design systems | Different composition and rhythm per section; no invented testimonials, metrics or pricing. |
| agents | Illustrated engineering-team and install workflow | Workflow reference, not a Lexora landing visual direction. No characters or terminal decoration imported. |
| kal odam | Engineering skills, planning and debugging workflow | Workflow reference, not landing artwork. |
| paywill] | OmniRoute provider setup and routing explanation | Separate local tooling task; no relevance to public educational copy or design. |
| 0 $ | Provider pooling and routing diagram | Separate local tooling reference; no token claims imported into Lexora. |
| freee | NVIDIA/provider onboarding | Separate local tooling reference; no provider branding added to the learning page. |
| Claude capture | Recall, pronunciation, answer reveal and four grading actions | Working public recall sample uses the same bilingual learning direction. |
| Abdulhady 08 Nov | Quiet recall followed by tests and completion | Interaction remains simple, with one action per exercise. |
| Abdulhady 12 Nov 11:29 | Deck progress, current task and weekly ranking | Classroom section describes existing daily work and verified ranking, without fabricated user scores. |
| Abdulhady 12 Nov 12:13 | Grammar structures, questions, corrections and highlighted vocabulary | Speaking sample has clickable grammar explanations. |
| Telegram capture | Bot and vocabulary file workflow | Existing Telegram pairing is preserved. Personal messages and reference footage are not published. |

Implemented beats: one animated hero scene; one contrasting type statement; one scroll-driven learning sequence. Phones use direct chapter controls. Reduced motion freezes the hero and makes chapters manually selectable. Animation is paused offscreen or when the page is hidden. No video files, external motion libraries or new image downloads are shipped.

## Verification

### v0.14 follow-up

The user's follow-up asks for the initial orbit itself to respond to scrolling. The coffee sequence and shipping-object sequence inform one continuous transformation: orbit opens, six tokens assemble into “I remember / the words I use.”, then an expanding coral circle carries the scene into the next section. Scroll remains native and reversible. The sentence is real DOM text when revealed; pause freezes the scene, reduced motion removes the sticky sequence, and offscreen/hidden canvases stop drawing.

Checked forward/reverse scrolling, explore-button progression and pause/resume in the browser. Checked 320×780, 390×844, 768×1024 and 1440×900 with no horizontal document overflow and primary action visible. Inspected light/dark initial states and the coral finale. Corrected a global dark-theme text-color override and the inter-section background seam. JavaScript syntax checks and all 82 existing automated tests pass. The standalone Impeccable CLI was unavailable in this follow-up; no new mechanical detector result is claimed. Physical-device GPU testing and OS reduced-motion emulation remain unverified.

### v0.13 verification

- Browser widths: 320, 390, 768, 1024, 1440. No horizontal document overflow; primary action visible in the first viewport. Light and dark inspected.
- Exercised flashcard reveal, chapter selection, sticky scroll state, grammar explanation, illustrative save, theme and animation pause. No browser console errors observed.
- Existing automated suite: 82 passing. Impeccable mechanical detector: no findings.
- Copy lint: 0 failures, 2 warnings. Short Uzbek headings/sentences are retained as deliberately compact interface copy; the English-language fragment/rhythm heuristic is not used to lengthen them artificially.
- The browser-only testing policy precludes the skill's separate headless browser gate. No GATE PASS is claimed. Reduced-motion behavior is implemented and code-reviewed, but OS preference emulation was not available in the browser tool. Physical-device GPU and keyboard testing remain outside this visual pass.
