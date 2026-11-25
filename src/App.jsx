import { useEffect, useMemo, useRef, useState } from "react";
import {
  simplifyText,
  textStats,
  gradeLabel,
  makeId,
  formatDate,
} from "./lib/text.js";
import { SAMPLE_TITLE, SAMPLE_TEXT, SAMPLE_SAVED } from "./lib/sample.js";
import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  SegmentedControl,
  Select,
  Textarea,
} from "./components/ui.jsx";

const STORE_KEY = "cleardoor-lessons-v1";
const SETTINGS_KEY = "cleardoor-reader-v1";

function loadLessons() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to the sample
  }
  return [SAMPLE_SAVED];
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // use defaults
  }
  return { size: 20, spacing: 1.7, theme: "paper", rate: 1 };
}

const VIEWS = [
  ["make", "Make it clear"],
  ["read", "Read"],
  ["library", "My library"],
];

export default function App() {
  const [view, setView] = useState("make");
  const [title, setTitle] = useState(SAMPLE_TITLE);
  const [input, setInput] = useState(SAMPLE_TEXT);
  const [result, setResult] = useState(null);
  const [lessons, setLessons] = useState(loadLessons);
  const [activeId, setActiveId] = useState(SAMPLE_SAVED.id);
  const [settings, setSettings] = useState(loadSettings);
  const [focusPara, setFocusPara] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const utterRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const liveStats = useMemo(() => textStats(input), [input]);
  const activeLesson =
    lessons.find((l) => l.id === activeId) || lessons[0] || null;

  function flash(msg) {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), 2600);
  }

  function handleSimplify() {
    if (!input.trim()) {
      flash("Paste a lesson first, or load the sample.");
      return;
    }
    setResult(simplifyText(input));
  }

  function handleSave() {
    if (!result) return;
    const lesson = {
      id: makeId(),
      title: title.trim() || "Untitled lesson",
      text: result.text,
      grade: result.after.grade,
      savedAt: Date.now(),
    };
    setLessons((prev) => [lesson, ...prev]);
    setActiveId(lesson.id);
    flash("Saved to your offline library.");
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard
      .writeText(result.text)
      .then(() => flash("Clear version copied."))
      .catch(() => flash("Copy failed on this browser."));
  }

  function openInReader(id) {
    setActiveId(id);
    setFocusPara(null);
    setView("read");
  }

  function deleteLesson(id) {
    setLessons((prev) => {
      const next = prev.filter((l) => l.id !== id);
      if (activeId === id && next[0]) setActiveId(next[0].id);
      return next;
    });
    flash("Lesson removed.");
  }

  function exportAll() {
    const body = lessons
      .map((l) => `${l.title}\n${"=".repeat(l.title.length)}\n\n${l.text}`)
      .join("\n\n\n");
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cleardoor-lessons.txt";
    a.click();
    URL.revokeObjectURL(url);
    flash("All lessons downloaded as one text file.");
  }

  function speak() {
    if (!activeLesson) return;
    if (!("speechSynthesis" in window)) {
      flash("This browser cannot read aloud.");
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(
      `${activeLesson.title}. ${activeLesson.text}`,
    );
    utter.rate = settings.rate;
    utter.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utter.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
    setPaused(false);
  }

  function togglePause() {
    if (!("speechSynthesis" in window)) return;
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }

  function stopSpeak() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }

  const filtered = lessons.filter((l) =>
    l.title.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-5 sm:px-6">
      <header className="topbar sticky top-3 z-20 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white/95 px-5 py-4 shadow-[0_2px_10px_rgba(11,79,74,0.07)] backdrop-blur">
        <div className="flex items-center gap-3.5">
          <span
            className="grid h-12 w-12 place-items-center rounded-xl bg-teal-deep text-white"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
              <path
                d="M5 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M3 21h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="13" cy="12" r="1.6" fill="currentColor" />
            </svg>
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              ClearDoor
            </h1>
            <p className="text-sm text-ink-soft">
              Lessons everyone can read, even offline.
            </p>
          </div>
        </div>
        <nav
          className="flex flex-wrap gap-1 rounded-full border-2 border-line bg-teal-tint p-1"
          aria-label="Main"
        >
          {VIEWS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={view === key}
              onClick={() => setView(key)}
              className={`min-h-11 rounded-full px-5 py-2 font-display text-sm font-semibold transition-colors ${
                view === key
                  ? "bg-teal-deep text-white shadow-sm"
                  : "text-teal-deep hover:bg-white"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {notice && (
        <div
          className="notice mt-4 rounded-xl border border-teal-main/40 bg-teal-soft px-5 py-3 text-center font-bold text-teal-deep"
          role="status"
        >
          {notice}
        </div>
      )}

      <main className="mt-5">
        {view === "make" && (
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="p-6">
              <h2 className="font-display text-xl font-bold">
                1. Paste the hard lesson
              </h2>
              <p className="mt-2 leading-relaxed text-ink-soft">
                Copy text from a textbook, worksheet or PDF. ClearDoor swaps
                hard words for plain ones and breaks long sentences into
                short ones.
              </p>
              <div className="mt-5">
                <Label htmlFor="lesson-title">Lesson title</Label>
                <Input
                  id="lesson-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Photosynthesis"
                />
              </div>
              <div className="mt-4">
                <Label htmlFor="lesson-text">Lesson text</Label>
                <Textarea
                  id="lesson-text"
                  rows={12}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste the lesson here..."
                  className="leading-relaxed"
                />
              </div>
              <div
                className="mt-4 flex flex-wrap gap-2"
                aria-live="polite"
              >
                <Badge>
                  Reading level: grade {liveStats.grade} (
                  {gradeLabel(liveStats.grade)})
                </Badge>
                <Badge>{liveStats.words} words</Badge>
                <Badge>{liveStats.avgSentence} words per sentence</Badge>
                <Badge>{liveStats.hardWords} hard words</Badge>
              </div>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Button onClick={handleSimplify}>Make it clear</Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setTitle(SAMPLE_TITLE);
                    setInput(SAMPLE_TEXT);
                    setResult(null);
                  }}
                >
                  Load sample lesson
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setTitle("");
                    setInput("");
                    setResult(null);
                  }}
                >
                  Clear
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-display text-xl font-bold">
                2. The clear version
              </h2>
              {!result ? (
                <div className="mt-3 leading-relaxed text-ink-soft">
                  <p>
                    Your plain-language version will appear here, with a
                    before and after reading level so you can see the
                    difference.
                  </p>
                  <ul className="mt-3 list-disc space-y-1.5 pl-5">
                    <li>Hard words swapped for everyday words</li>
                    <li>Long sentences split into short ones</li>
                    <li>Reading level measured before and after</li>
                  </ul>
                </div>
              ) : (
                <>
                  <div className="mt-4 flex items-stretch gap-3">
                    <div className="compare-box flex flex-1 flex-col gap-1 rounded-xl border border-warm/40 bg-warm-soft p-4 text-sm">
                      <span className="font-display text-xs font-bold uppercase tracking-wider text-warm">
                        Before
                      </span>
                      <strong className="font-display text-xl">
                        Grade {result.before.grade}
                      </strong>
                      <span>
                        {result.before.avgSentence} words per sentence
                      </span>
                      <span>{result.before.hardWords} hard words</span>
                    </div>
                    <div
                      className="self-center text-2xl text-teal-deep"
                      aria-hidden="true"
                    >
                      &#8594;
                    </div>
                    <div className="compare-box flex flex-1 flex-col gap-1 rounded-xl border border-teal-main/40 bg-teal-soft p-4 text-sm">
                      <span className="font-display text-xs font-bold uppercase tracking-wider text-teal-deep">
                        After
                      </span>
                      <strong className="font-display text-xl">
                        Grade {result.after.grade}
                      </strong>
                      <span>
                        {result.after.avgSentence} words per sentence
                      </span>
                      <span>{result.after.hardWords} hard words</span>
                    </div>
                  </div>
                  <div
                    className="result-text mt-4 max-h-[340px] overflow-y-auto rounded-xl border border-line bg-teal-tint px-5 py-4 leading-[1.75]"
                    tabIndex={0}
                  >
                    {result.text.split(/\n\s*\n/).map((p, i) => (
                      <p key={i} className="mb-3 last:mb-0">
                        {p}
                      </p>
                    ))}
                  </div>
                  {result.changes.length > 0 && (
                    <details className="mt-3 text-[0.95rem]">
                      <summary className="cursor-pointer font-display font-semibold text-teal-deep">
                        Words made plain ({result.changes.length})
                      </summary>
                      <p className="mt-1.5 leading-relaxed text-ink-soft">
                        {result.changes
                          .map((c) => `${c.from} to ${c.to}`)
                          .join(", ")}
                      </p>
                    </details>
                  )}
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <Button onClick={handleSave}>Save to library</Button>
                    <Button variant="ghost" onClick={handleCopy}>
                      Copy text
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (result) {
                          setInput(result.text);
                          setResult(null);
                          flash("Clear version loaded. You can run it again.");
                        }
                      }}
                    >
                      Edit this version
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}

        {view === "read" && (
          <div className="grid items-start gap-5 lg:grid-cols-[320px_1fr]">
            <Card className="controls p-6">
              <h2 className="font-display text-xl font-bold">
                Reading controls
              </h2>
              <div className="mt-4">
                <Label htmlFor="pick-lesson">Lesson</Label>
                <Select
                  id="pick-lesson"
                  value={activeLesson ? activeLesson.id : ""}
                  onChange={(e) => {
                    setActiveId(e.target.value);
                    setFocusPara(null);
                  }}
                >
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="mt-5">
                <Label htmlFor="font-size">
                  Text size: {settings.size}px
                </Label>
                <input
                  id="font-size"
                  type="range"
                  min="16"
                  max="30"
                  step="1"
                  value={settings.size}
                  onChange={(e) =>
                    setSettings({ ...settings, size: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              <div className="mt-3">
                <Label htmlFor="line-spacing">
                  Line spacing: {settings.spacing.toFixed(1)}
                </Label>
                <input
                  id="line-spacing"
                  type="range"
                  min="1.3"
                  max="2.2"
                  step="0.1"
                  value={settings.spacing}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      spacing: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

              <div className="mt-4">
                <span className="mb-1.5 block font-display text-sm font-semibold">
                  Page style
                </span>
                <SegmentedControl
                  label="Page style"
                  value={settings.theme}
                  onChange={(theme) => setSettings({ ...settings, theme })}
                  options={[
                    ["paper", "Paper"],
                    ["night", "Night"],
                    ["contrast", "High contrast"],
                  ]}
                />
              </div>

              <div className="mt-5">
                <span className="mb-1.5 block font-display text-sm font-semibold">
                  Listen
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {!speaking ? (
                    <Button onClick={speak}>Read aloud</Button>
                  ) : (
                    <>
                      <Button onClick={togglePause}>
                        {paused ? "Resume" : "Pause"}
                      </Button>
                      <Button variant="ghost" onClick={stopSpeak}>
                        Stop
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="speech-rate">
                  Voice speed: {settings.rate.toFixed(1)}x
                </Label>
                <input
                  id="speech-rate"
                  type="range"
                  min="0.6"
                  max="1.4"
                  step="0.1"
                  value={settings.rate}
                  onChange={(e) =>
                    setSettings({ ...settings, rate: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Tip: tap any paragraph to focus on it. Tap it again to show
                everything.
              </p>
              <Button
                variant="ghost"
                className="mt-4"
                onClick={() => window.print()}
              >
                Print this lesson
              </Button>
            </Card>

            <article
              className={`reading-page theme-${settings.theme} rounded-2xl border border-line px-6 py-8 shadow-[0_2px_10px_rgba(11,79,74,0.07)] sm:px-10`}
              style={{
                fontSize: `${settings.size}px`,
                lineHeight: settings.spacing,
              }}
            >
              {activeLesson ? (
                <>
                  <h2 className="font-display text-[1.5em] font-bold">
                    {activeLesson.title}
                  </h2>
                  <p className="mb-5 mt-1 text-[0.7em] opacity-75">
                    Reading level grade {activeLesson.grade} - about{" "}
                    {textStats(activeLesson.text).minutes} min read
                  </p>
                  {activeLesson.text.split(/\n\s*\n/).map((p, i) => (
                    <p
                      key={i}
                      className={`para mb-[1em] rounded-lg px-2 py-1 ${
                        focusPara === null || focusPara === i ? "" : "dim"
                      }`}
                      onClick={() =>
                        setFocusPara(focusPara === i ? null : i)
                      }
                    >
                      {p}
                    </p>
                  ))}
                </>
              ) : (
                <p>No lesson yet. Make one clear first, then save it.</p>
              )}
            </article>
          </div>
        )}

        {view === "library" && (
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold">
                  My offline library
                </h2>
                <p className="mt-2 max-w-xl leading-relaxed text-ink-soft">
                  Lessons are saved on this device only. No account, no
                  internet needed. They stay here when the signal drops.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Input
                  className="search w-56"
                  type="search"
                  placeholder="Search lessons"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search lessons"
                />
                <Button
                  variant="ghost"
                  onClick={exportAll}
                  disabled={lessons.length === 0}
                >
                  Download all (.txt)
                </Button>
              </div>
            </div>
            {filtered.length === 0 ? (
              <p className="mt-5 leading-relaxed text-ink-soft">
                No lessons match. Make a lesson clear and save it, and it
                will live here.
              </p>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((l) => {
                  const s = textStats(l.text);
                  return (
                    <article
                      key={l.id}
                      className="card flex flex-col rounded-2xl border border-line bg-teal-tint p-5"
                    >
                      <h3 className="font-display text-lg font-bold">
                        {l.title}
                      </h3>
                      <p className="mt-1 text-sm text-ink-soft">
                        Grade {l.grade} - {s.words} words - about {s.minutes}{" "}
                        min - saved {formatDate(l.savedAt)}
                      </p>
                      <p className="mt-2 flex-1 leading-relaxed">
                        {l.text.slice(0, 160)}
                        {l.text.length > 160 ? "..." : ""}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2.5">
                        <Button size="sm" onClick={() => openInReader(l.id)}>
                          Open and read
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteLesson(l.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </Card>
        )}
      </main>

      <footer className="foot mt-6 rounded-2xl border border-line bg-teal-tint px-6 py-5 text-center leading-relaxed text-ink-soft">
        <p>
          ClearDoor removes one barrier: lesson text that is too hard to
          read. Plain words, short sentences, big readable type, a voice
          that reads aloud, and an offline library for shared or older
          phones.
        </p>
      </footer>
    </div>
  );
}
