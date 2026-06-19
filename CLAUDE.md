# morning-alarm

**Repo:** `ButterhorseLabs/morning-alarm`  
**Deploy target:** GitHub Pages (static, no backend)  
**Stack:** React + Vite + Tailwind CSS  
**Purpose:** Help progressive/left-wing podcast creators get their shows into the Google Assistant News Briefing system — the channel that plays audio on Android alarm dismissal. Most creators don't know this exists. This tool explains it, validates their RSS feed against Google's requirements, and hands them off to Google's submission form with everything pre-summarized.

---

## Project structure

```
morning-alarm/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/
│   │   ├── Hero.jsx
│   │   ├── EligibilityQuiz.jsx
│   │   ├── RSSValidator.jsx
│   │   ├── ValidationResults.jsx
│   │   └── SubmissionGuide.jsx
│   ├── lib/
│   │   └── rssChecks.js
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## User flow

The app is a single-page linear wizard. No routing needed. State lives in `App.jsx` and flows down via props.

```
[Hero] → [EligibilityQuiz] → [RSSValidator] → [ValidationResults] → [SubmissionGuide]
```

Each step renders below the previous one (accordion-style scroll), not as separate pages. Once a step is completed, it collapses to a summary bar. The user can re-expand any step.

---

## Step 1 — Hero

**File:** `src/components/Hero.jsx`

A punchy explainer section. No interactivity, just content and a CTA button.

**Copy:**

- Headline: `Your morning show could wake up America.`
- Subhead: `Android phones play short news and podcast clips when people dismiss their morning alarm. The channel is dominated by CNN, Fox, and NPR — because most independent creators don't know it exists. This tool changes that.`
- Short explanation of how Google Assistant News Briefings work (2–3 sentences, plain language, no jargon)
- Bullet list of what this tool does:
  - Checks if your show qualifies
  - Validates your RSS feed against Google's requirements
  - Prepares everything you need for the 5-minute submission form
- CTA button: `Check my show →` → scrolls to / reveals Step 2

---

## Step 2 — Eligibility Quiz

**File:** `src/components/EligibilityQuiz.jsx`

A short self-assessment to gate out shows that clearly won't qualify before they go through RSS validation. 4 yes/no questions rendered as button pairs. All must be "yes" to proceed.

**Questions:**

1. `Does your show cover news, politics, current events, or commentary on them?`  
   *(Maps to Google's category requirement: Politics, World, National, General, Business, etc.)*

2. `Do you publish new episodes at least a few times a week?`  
   *(Google requires "timely and regular" updates — hourly or daily preferred. A few times a week is the practical minimum.)*

3. `Is your show primarily in English?`  
   *(Simplification for v1. English covers AU, CA, GB, IE, IN, PH, SG, US. A note can mention other supported languages without building the full matrix.)*

4. `Do you have a public RSS feed? (Spotify for Podcasters, Apple Podcasts, Buzzsprout, Anchor, Transistor, etc. all generate one automatically)`

**Failure state:** If any answer is "no", show a friendly message explaining why that specific criterion matters and that the tool can't help right now — but don't dead-end them. Include the Google docs link so they can read eligibility themselves.

**Success state:** Show a green checkmark summary and reveal Step 3.

---

## Step 3 — RSS Validator

**File:** `src/components/RSSValidator.jsx`  
**Logic:** `src/lib/rssChecks.js`

A text input for the RSS feed URL plus a "Validate" button.

### Fetching the feed

Browser CORS policy will block direct cross-origin RSS fetches. Use the `allorigins.win` CORS proxy:

```js
const PROXY = 'https://api.allorigins.win/get?url=';

async function fetchFeed(url) {
  const res = await fetch(`${PROXY}${encodeURIComponent(url)}`);
  const json = await res.json();
  return json.contents; // raw XML string
}
```

Parse the XML string using the browser's built-in `DOMParser`:

```js
const parser = new DOMParser();
const doc = parser.parseFromString(xmlString, 'application/xml');
```

Show a loading spinner during fetch. Handle fetch errors (network, invalid URL, proxy failure) gracefully with a user-friendly message.

### Validation checks

All checks are defined in `src/lib/rssChecks.js` and return objects of shape:
```js
{ id: string, label: string, status: 'pass' | 'fail' | 'warn', detail: string }
```

**Channel-level checks** (required by Google):

| Check ID | What to check | Pass condition | Fail message |
|---|---|---|---|
| `rss-version` | `<rss version="...">` attribute | value is `"2.0"` | "Feed must be RSS 2.0" |
| `itunes-namespace` | `xmlns:itunes` on `<rss>` tag | present | "Missing iTunes namespace declaration — required for `<itunes:duration>`" |
| `channel-title` | `<channel><title>` | present and non-empty | "Feed is missing a channel title" |
| `channel-link` | `<channel><link>` | present, non-empty, starts with `http` | "Feed is missing a valid channel link URL" |
| `channel-description` | `<channel><description>` | present and non-empty | "Feed is missing a channel description" |
| `channel-image` | `<channel><image><url>` | present | "Feed is missing a channel image" |
| `channel-image-size` | Image dimensions | Cannot check in browser — emit as `warn` | "Google requires your show artwork to be at least 1400×1400px. Verify this manually." |

**Item-level checks** (run against the most recent `<item>` only):

| Check ID | What to check | Pass condition | Fail message |
|---|---|---|---|
| `item-exists` | At least one `<item>` | present | "Feed has no episodes" |
| `item-title` | `<item><title>` | present and non-empty | "Latest episode is missing a title" |
| `item-description` | `<item><description>` | present and non-empty | "Latest episode is missing a description" |
| `item-enclosure` | `<item><enclosure url="..." type="..." length="...">` | all three attributes present | "Latest episode is missing an enclosure tag (the audio file reference)" |
| `item-enclosure-type` | `type` attribute on enclosure | one of: `audio/mpeg`, `audio/aac`, `audio/mp4`, `audio/wav`, `video/mp4`, `application/x-mpegurl` | "Audio type '{{type}}' may not be supported. Supported types: mp3, aac, m4a, wav, mp4" |
| `item-enclosure-url` | `url` attribute on enclosure | present and starts with `http` | "Enclosure URL is missing or malformed" |
| `item-guid` | `<item><guid>` | present and non-empty | "Latest episode is missing a GUID" |
| `item-pubdate` | `<item><pubDate>` | present, parseable as date | "Latest episode is missing a publication date" |
| `item-freshness` | pubDate age | warn if older than 7 days | "Latest episode is {{N}} days old. Google prefers daily or near-daily updates." |
| `item-duration` | `<itunes:duration>` | present and non-empty | "Missing `<itunes:duration>` — required by Google" |
| `item-duration-length` | parsed duration value | warn if under 60 seconds or over 30 minutes | "Episode duration is {{N}} — Google recommends 5–10 minutes for news briefings" |

**Metadata extraction** (not pass/fail, just surfaced for the SubmissionGuide):

Extract and return:
- `feedTitle` — from `<channel><title>`
- `feedDescription` — from `<channel><description>`
- `feedUrl` — the URL the user entered
- `feedImageUrl` — from `<channel><image><url>`
- `feedLanguage` — from `<channel><language>` (default: `"en-us"` if absent)
- `latestEpisodeTitle` — from latest `<item><title>`
- `latestPubDate` — from latest `<item><pubDate>`
- `enclosureType` — audio or video

---

## Step 4 — Validation Results

**File:** `src/components/ValidationResults.jsx`

Renders the array of check results from Step 3.

**Layout:**
- Pass/fail/warn counts at the top as a summary bar
- Scrollable list of all checks, each with an icon (✅ / ❌ / ⚠️), label, and detail message
- Failed items are visually prominent (red border/background)
- Warn items are yellow
- Pass items are green but visually quieter

**States:**
- **All pass:** Show celebration message + "You're ready to submit" CTA → reveals Step 5
- **Has failures:** Show "Fix these issues before submitting" message. Each failure has a "How to fix this" expandable section with plain-language guidance (see Fix Guidance below).
- **Only warnings:** Treat same as all-pass — show CTA but mention the warnings

**Fix Guidance** (expand-on-click per failed check):

| Check ID | Fix guidance |
|---|---|
| `rss-version` | "Your feed host should handle this. Contact their support or check their RSS settings." |
| `itunes-namespace` | "Add `xmlns:itunes=\"http://www.itunes.com/dtds/podcast-1.0.dtd\"` to the opening `<rss>` tag in your feed. Most modern podcast hosts do this automatically — if yours doesn't, switch hosts or manually edit your feed template." |
| `channel-title` | "Add a `<title>` tag inside your `<channel>` block." |
| `channel-link` | "Add a `<link>` tag with your show's homepage URL inside `<channel>`." |
| `channel-description` | "Add a `<description>` tag inside `<channel>`. This is usually your show description." |
| `channel-image` | "Add an `<image>` block with `<url>`, `<title>`, and `<link>` sub-tags. Most podcast hosts generate this from your show artwork." |
| `item-exists` | "Publish at least one episode before submitting." |
| `item-title` | "Your latest episode is missing a title. Edit it in your podcast host dashboard." |
| `item-description` | "Your latest episode is missing a description. Add one in your podcast host dashboard." |
| `item-enclosure` | "The `<enclosure>` tag points Google to your actual audio file. Your podcast host generates this automatically for every episode — if it's missing, something is wrong with your feed. Contact your host's support." |
| `item-enclosure-type` | "Update your enclosure's `type` attribute to a supported MIME type. `audio/mpeg` (MP3) is the safest choice." |
| `item-guid` | "Each episode needs a unique GUID. Your podcast host should generate this automatically." |
| `item-pubdate` | "Add a `<pubDate>` in RFC 822 format, e.g. `Thu, 22 Sep 2016 21:11:46 GMT`. Your podcast host should handle this." |
| `item-duration` | "Add `<itunes:duration>` to your episode's `<item>` block. Format: `HH:MM:SS` or total seconds. Example: `<itunes:duration>600</itunes:duration>`. Your podcast host usually adds this automatically." |

---

## Step 5 — Submission Guide

**File:** `src/components/SubmissionGuide.jsx`

Google's submission form is a Google Form and cannot be pre-filled via URL params. Instead, this step shows the user exactly what to copy-paste into each field, then opens the form in a new tab.

**Layout:**

Heading: `You're ready. Here's what to bring to Google's form.`

A styled "cheat sheet" card with copy-to-clipboard buttons on each field:

| Label | Value | Source |
|---|---|---|
| Show name | `{{feedTitle}}` | extracted from feed |
| RSS feed URL | `{{feedUrl}}` | user input |
| Show description | `{{feedDescription}}` | extracted from feed |
| Image URL | `{{feedImageUrl}}` | extracted from feed |
| News category | *(dropdown — user selects from Google's list)* | user picks |
| Language / Country | *(user selects — prefill to `English / US` by default)* | user picks |
| Synonyms | *(user fills in — optional, up to 5)* | user fills |

Below the card, two prominent buttons:

- **Primary:** `Open Google's submission form →` (opens `https://support.google.com/faqs/contact/news_briefings_default` in new tab)
- **Secondary:** `Copy everything to clipboard` (copies all fields as formatted plain text)

**Also include:**

A "What happens next" section:
- Google reviews in 5–7 business days
- They may email with questions
- Once live, tell your audience: "Say 'Hey Google, play [your show name]' to add us to your morning alarm"
- Link to Google's support contact for issues: `audio-news-support@google.com`

**LUFS callout box:**
> ⚠️ **One thing we can't check automatically:** Google requires your audio to be between -16 and -19 LUFS. Most professionally produced podcasts already meet this. You can verify yours for free at [youlean.co/file-loudness-meter](https://youlean.co/file-loudness-meter/) — just upload a recent episode.

---

## Visual design

Tone: **urgent but approachable**. This is a civic action tool, not a SaaS product. Think zine energy meets utility.

- Dark background (`#0f0f0f` or similar near-black)
- Accent color: a warm red or orange — something that reads "broadcast" / "on air"
- Monospace font for RSS field names and code snippets
- Clean sans-serif for body copy
- Each step has a large number indicator (01, 02, 03...) in the accent color
- Mobile-first — many creators will share this link on social and open it on their phone

No component library needed. Tailwind utility classes only.

---

## Technical notes

### CORS proxy fallback

`allorigins.win` is a free public proxy and may occasionally be down. If the initial fetch fails, retry once with `https://corsproxy.io/?` as an alternative proxy. If both fail, show a message: "We couldn't fetch your feed — it may be temporarily unavailable, or blocked from external access. Try again or paste your feed XML directly." (v2 feature: textarea fallback for paste-in XML)

### XML parsing edge cases

- Feed may use CDATA sections: `<description><![CDATA[...]]></description>` — DOMParser handles this correctly, `textContent` will unwrap it
- Namespaced tags like `<itunes:duration>`: use `getElementsByTagNameNS('*', 'duration')` or `querySelector('itunes\\:duration')` — test both since browser behaviour varies
- Some feeds may return as `text/xml` vs `application/rss+xml` — DOMParser handles both

### No backend, no storage

All processing is client-side. No user data is stored anywhere. The only outbound request is to the CORS proxy to fetch the user's RSS feed, which is already public.

---

## GitHub setup

- Repo: `ButterhorseLabs/morning-alarm`
- Branch: `main`
- Deploy: GitHub Pages via `gh-pages` branch, using `vite build` output from `dist/`
- Add a `vite.config.js` with `base: '/morning-alarm/'` for correct asset paths on GH Pages
- `README.md` should include: what it is, how to run locally, how to contribute, link to the live site

---

## Future / v2 ideas (do not build now)

- **Paste-in XML fallback** for feeds that can't be fetched via proxy
- **Multi-language support** — the eligibility quiz currently gates to English only; v2 could support ES/FR/DE
- **Show directory** — community-submitted list of left/progressive shows already approved, with "add to your Google Assistant" instructions for listeners
- **Alexa Flash Briefing checker** — same channel exists on Alexa with a slightly different submission flow
- **Share card generator** — once approved, generate a shareable image: "Find us on your Android alarm clock — say 'Hey Google, play [show name]'"
