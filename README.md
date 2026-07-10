# Study Assistant

Paste your notes (or just a topic), and it generates a set of flashcards and a
multiple-choice quiz. Flip through the cards, take the quiz, and retest just
the questions you got wrong — no extra AI call needed for the retest, since
the questions are already in memory.

## Setup

Requires Node 18+ (for native `fetch` in the backend).

```bash
git clone <your-repo-url>
cd study-assistant
npm install
```

`npm install` also installs the `server` and `client` dependencies via a
`postinstall` hook, so you only run it once at the root.

You'll need a free [Groq API key](https://console.groq.com/keys):

```bash
cp server/.env.example server/.env
# then edit server/.env and paste your key in place of "your_groq_api_key_here"
```

Then:

```bash
npm start
```

This runs the Express backend on `http://localhost:3001` and the Vite dev
server on `http://localhost:5173` at the same time. Open the client URL in
your browser. The Vite dev server proxies `/api/*` requests to the backend,
so there's no CORS setup needed and the API key never reaches the browser.

## How it's structured

```
server/   Express API. Owns the Groq API key. Validates the AI's JSON
          before it's ever sent to the client.
client/   Vite + React. Free-form input, tabs for Flashcards/Quiz,
          all interactive state lives here.
```

**Why a separate backend:** the assignment requires the API key never ship
to the browser. A serverless function would work too, but a small Express
server is simpler to run and demo locally.

**The AI contract:** the backend asks Groq (in JSON mode) for one object —
`{ topic, flashcards: [...], quiz: [...] }` — and describes the exact shape
in the system prompt. The frontend never sees raw model text; it only ever
receives data that already passed server-side validation.

## Handling bad AI output

This was the main point of the assignment, so here's what's actually
happening, end to end:

- **Malformed JSON** — the model is asked for `response_format: json_object`,
  but the server still wraps parsing in try/catch and strips stray code
  fences before parsing. A parse failure returns a clean 502 with a message,
  never a crash.
- **Wrong shape** — `validateShape()` in `server/index.js` checks every
  field: are `flashcards`/`quiz` non-empty arrays, does every flashcard have
  a non-empty `front`/`back`, does every quiz question have exactly 4
  options and a valid `answerIndex`. Anything that fails this check never
  reaches the client.
- **Empty response** — checked explicitly before parsing is even attempted.
- **Slow response** — the backend aborts the Groq request after 25s and
  returns a 504 rather than hanging indefinitely.
- **Failed request** — network errors, non-2xx responses, and rate limits
  (429) are all caught and turned into a plain-language error message.
- **Stale responses** — if you submit a second generation while the first
  is still loading, `useGenerate.js` aborts the in-flight request and tags
  every request with an incrementing ID. If a response comes back for a
  request that's no longer the "current" one, it's silently dropped instead
  of overwriting newer state.
- **UI never crashes** — every state (`idle`, `loading`, `error`, `success`)
  is rendered explicitly in `App.jsx`; there's no code path that tries to
  render `undefined` data.

## AI-usage note

I used an AI assistant to help scaffold this project — the Express
validation logic, the React hooks structure (particularly the stale-request
guard in `useGenerate.js`), and the CSS. I reviewed, tested, and understand
every part of it and can walk through or modify any file live. [Adjust this
paragraph to reflect what you actually did before submitting.]

## Stretch goal implemented: save & reload sessions

Every successful generation is saved to `localStorage` (`client/src/sessions.js`)
and shown as a row of chips under the input. Clicking one calls
`loadSession()` in `useGenerate.js`, which sets the study set straight into
state — no API call, so reopening an old session is instant. Up to 10 recent
sessions are kept; each can be deleted individually. This only lives in the
browser (no backend/database), so it won't follow you to another device —
that'd be the natural next step if this needed to scale further.

## Known limitations

- Session history is per-browser (localStorage), not synced across devices.
- The quiz only supports single-answer multiple choice; no short-answer or
  multi-select questions.
- Very short or vague input (e.g. a single word) can produce a thin or
  generic study set — the AI still tries rather than rejecting it outright.
- No automated tests; validation was done manually plus the shape-checking
  logic in `validateShape()`.

## Time spent

[Fill in — e.g. "~7 hours: 2 backend, 3 frontend/state, 1 styling, 1 README
and testing failure cases."]
