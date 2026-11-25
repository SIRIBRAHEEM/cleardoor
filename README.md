# ClearDoor

Lessons everyone can read, even offline.

ClearDoor turns hard lesson text into plain, readable lessons. Paste text
from a textbook, worksheet or PDF. ClearDoor swaps formal words for
everyday words, breaks long sentences into short ones, and shows the
reading level before and after. Saved lessons live in an offline library
on the device, with a calm reader: big type, wide spacing, paper, night
and high contrast styles, focus mode, and a read-aloud voice.

Built for AccessED Hacks 2026. The barrier it removes: lesson text that
is too hard to read for learners with low literacy, low vision, or a
second language, on shared or older phones with weak signal.

## Run it

```bash
npm install
npm run dev
```

Open the local address Vite prints. The sample photosynthesis lesson is
already loaded, so you can press "Make it clear" straight away.

## Build and test

```bash
npm run build   # production build into dist/
npm test        # 11 unit tests for the text logic (node test runner)
npm run lint    # oxlint
node scripts/e2e.mjs   # 16 browser checks + screenshots into docs/
```

## How it works

- `src/lib/text.js` holds the core logic as pure functions: a syllable
  counter, sentence splitter, Flesch-Kincaid reading grade, a plain-word
  dictionary of about 380 formal words, and a sentence splitter that
  breaks long sentences at natural joins.
- `src/lib/sample.js` holds the sample textbook lesson and a saved
  clear version.
- `src/App.jsx` is the interface: three views (Make it clear, Read, My
  library). Lessons and reader settings persist in localStorage.
- The interface is built with Tailwind CSS and a small design system of
  hand-built components in `src/components/ui.jsx` (buttons, cards,
  badges, fields, segmented controls) in the shadcn/ui style. The look
  is an accessibility-first reading room: solid white surfaces, deep
  teal, extra-large readable type, generous spacing and big clear
  buttons, with strong focus rings for keyboard users.
- Read aloud uses the browser speechSynthesis voice, so it works with
  no server and no API key.
- Fonts (Sora and Atkinson Hyperlegible) are self-hosted in
  `public/fonts`, so the app works fully offline.

## Limitations

- The simplifier is rule based. It swaps words and splits sentences,
  but it cannot rewrite ideas, so some sentences still need a human
  edit. Scientific names like photosynthesis stay as they are.
- Reading level is the Flesch-Kincaid estimate. It is a guide, not a
  promise about any one reader.
- Read aloud depends on the voices installed on the device.
- Lessons are stored in the browser on one device. Clearing browser
  data removes them. Use "Download all" in the library to keep a copy.
