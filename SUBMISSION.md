# ClearDoor - Devpost submission texts for AccessED Hacks

Copy each block into the matching Devpost field.

## Project name

ClearDoor

## Tagline (short pitch)

Lessons everyone can read, even offline. ClearDoor turns hard textbook text into plain, readable lessons on any phone.

## Team members

Ibrahim Yahaya (solo)

## The problem

A lesson cannot help a learner who cannot read it. In my classes, many
students meet science and English passages written in dense academic
language: long sentences, formal words, small print. A student reading
in a second language, a student with low vision, or a student reading
on a shared phone with a cracked screen gives up before the idea lands.
Teachers know the text is the barrier, but rewriting every passage by
hand takes time they do not have. And when the signal drops, most
learning apps stop working completely.

## Intended users

- Students who find textbook language hard: second-language readers,
  low-literacy readers, and students with low vision.
- Teachers who want a fast first draft of a plain-language version of a
  lesson, to edit and share.
- Anyone learning on a shared or older phone with weak or no signal.

## The solution

ClearDoor is a small web app with three screens.

1. Make it clear. Paste a lesson. ClearDoor swaps formal words for
   everyday words (utilise becomes use, approximately becomes about),
   breaks long sentences into short ones, and measures the reading
   level before and after with the Flesch-Kincaid grade, so the change
   is visible, not a claim.
2. Read. Saved lessons open in a calm reader: large type in Atkinson
   Hyperlegible, a font designed for low-vision readers, adjustable
   text size and line spacing, paper, night and high contrast styles,
   a focus mode that dims everything except the paragraph you tap, and
   a read-aloud voice with speed control.
3. My library. Lessons are saved on the device with localStorage. No
   account, no server, no signal needed. The whole library can be
   downloaded as one text file for printing or sharing.

## One concrete before and after

Sample lesson: a textbook paragraph on photosynthesis.

- Before: reading grade 16.3, 25.6 words per sentence, 43 hard words.
- After: reading grade 10.8, 17.5 words per sentence, 32 hard words,
  with 29 words made plain.

Before: "Photosynthesis is the biochemical process by which green
plants utilise sunlight, water, and carbon dioxide to produce glucose
and oxygen."

After: "Photosynthesis is the biochemical process by which green
plants use sunlight, water, and carbon dioxide to make sugar and
oxygen."

A teacher can then edit the clear version in one tap and save it for
the class.

## Technologies

- React and Vite for the app.
- Tailwind CSS with a small design system of hand-built components
  (buttons, cards, badges, form fields, segmented controls) in the
  shadcn/ui style. The design is an accessibility-first reading room:
  solid white surfaces, deep teal, extra-large readable type, generous
  spacing, big clear buttons and strong focus rings.
- Sora for headings and Atkinson Hyperlegible for body text, both
  self-hosted so the app works offline.
- localStorage for the offline lesson library and reader settings.
- The browser speechSynthesis voice for read aloud. No server, no API
  key.
- The core text logic (syllable counting, reading grade, word swaps,
  sentence splitting) is written as pure functions and covered by 11
  unit tests. The interface is checked with 16 automated browser
  checks, with zero console errors.

## Challenges

The hard part was making the simplification honest. A word swap can
break grammar ("process" to "steps" reads badly in some sentences), so
I removed swaps that do not survive real sentences and kept the swaps
that do. Splitting long sentences also needed care: splitting at the
wrong join makes nonsense, so the splitter only breaks at natural
joins and only when both halves stay long enough to make sense. I also
had to accept what a rule-based tool cannot do: it cannot rewrite
ideas, so the app presents its output as a first draft a teacher can
edit, and says so.

## What I learned

I learned that a small, measurable change beats a big claim. Showing
the reading grade before and after makes the improvement checkable by
anyone in seconds. I also learned to design for the reader first: big
type, wide spacing, high contrast and a voice matter more than extra
features. And I learned that offline is a feature, not a fallback.
For the learners I built this for, offline is the normal case.

## Setup steps

```bash
npm install
npm run dev
```

Open the local address Vite prints. The sample photosynthesis lesson
is loaded already. Press "Make it clear", then save it and open the
Read screen to try the reader controls and read aloud.

## Limitations

- The simplifier is rule based. It swaps words and splits sentences
  but cannot rewrite ideas, so some output still needs a human edit.
- Scientific names stay unchanged on purpose.
- The reading grade is an estimate, not a promise about any one
  reader.
- Read aloud depends on the voices installed on the device.
- Lessons live in one browser on one device. The download button
  keeps a copy.

## Links

- Live demo: [add the deployed link here]
- Demo video: [add the YouTube link here]
- Source code: [add the GitHub repo link here]
- Screenshots: in the docs folder of the repo.

## Credits and disclosures

- React and Vite (open source).
- Sora and Atkinson Hyperlegible fonts from Google Fonts (OFL
  licence), self-hosted in the repo.
- The sample lesson text was written for this project. No real
  student data is used anywhere.
- AI assistance disclosure: an AI coding assistant helped me write
  and test the code and draft this submission text. The idea, the
  design choices, and the final product are mine. No AI service runs
  inside the app itself.
- All work on this project was done during the AccessED Hacks event
  period. There is no pre-existing foundation.
