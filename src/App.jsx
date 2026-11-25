import { useEffect, useMemo, useRef, useState } from "react";
import {
  simplifyText,
  textStats,
  gradeLabel,
  makeId,
  formatDate,
} from "./lib/text.js";
import { SAMPLE_TITLE, SAMPLE_TEXT, SAMPLE_SAVED } from "./lib/sample.js";

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
    <div className="scene">
      <div className="blob blob-a" aria-hidden="true" />
      <div className="blob blob-b" aria-hidden="true" />
      <div className="blob blob-c" aria-hidden="true" />

      <header className="topbar glass">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
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
            <h1>ClearDoor</h1>
            <p>Lessons everyone can read, even offline.</p>
          </div>
        </div>
        <nav className="tabs" aria-label="Main">
          {[
            ["make", "Make it clear"],
            ["read", "Read"],
            ["library", "My library"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={view === key ? "tab active" : "tab"}
              onClick={() => setView(key)}
              aria-pressed={view === key}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {notice && (
        <div className="notice glass" role="status">
          {notice}
        </div>
      )}

      <main className="wrap">
        {view === "make" && (
          <section className="grid-two">
            <div className="panel glass">
              <h2>1. Paste the hard lesson</h2>
              <p className="hint">
                Copy text from a textbook, worksheet or PDF. ClearDoor swaps
                hard words for plain ones and breaks long sentences into
                short ones.
              </p>
              <label className="field-label" htmlFor="lesson-title">
                Lesson title
              </label>
              <input
                id="lesson-title"
                className="text-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Photosynthesis"
              />
              <label className="field-label" htmlFor="lesson-text">
                Lesson text
              </label>
              <textarea
                id="lesson-text"
                className="text-area"
                rows={12}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste the lesson here..."
              />
              <div className="stat-row" aria-live="polite">
                <span className="chip">
                  Reading level: grade {liveStats.grade} (
                  {gradeLabel(liveStats.grade)})
                </span>
                <span className="chip">{liveStats.words} words</span>
                <span className="chip">
                  {liveStats.avgSentence} words per sentence
                </span>
                <span className="chip">{liveStats.hardWords} hard words</span>
              </div>
              <div className="actions">
                <button
                  type="button"
                  className="btn primary"
                  onClick={handleSimplify}
                >
                  Make it clear
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    setTitle(SAMPLE_TITLE);
                    setInput(SAMPLE_TEXT);
                    setResult(null);
                  }}
                >
                  Load sample lesson
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    setTitle("");
                    setInput("");
                    setResult(null);
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="panel glass">
              <h2>2. The clear version</h2>
              {!result ? (
                <div className="empty">
                  <p>
                    Your plain-language version will appear here, with a
                    before and after reading level so you can see the
                    difference.
                  </p>
                  <ul className="ticks">
                    <li>Hard words swapped for everyday words</li>
                    <li>Long sentences split into short ones</li>
                    <li>Reading level measured before and after</li>
                  </ul>
                </div>
              ) : (
                <>
                  <div className="compare">
                    <div className="compare-box">
                      <span className="compare-label">Before</span>
                      <strong>Grade {result.before.grade}</strong>
                      <span>
                        {result.before.avgSentence} words per sentence
                      </span>
                      <span>{result.before.hardWords} hard words</span>
                    </div>
                    <div className="compare-arrow" aria-hidden="true">
                      &#8594;
                    </div>
                    <div className="compare-box good">
                      <span className="compare-label">After</span>
                      <strong>Grade {result.after.grade}</strong>
                      <span>
                        {result.after.avgSentence} words per sentence
                      </span>
                      <span>{result.after.hardWords} hard words</span>
                    </div>
                  </div>
                  <div className="result-text" tabIndex={0}>
                    {result.text.split(/\n\s*\n/).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                  {result.changes.length > 0 && (
                    <details className="changes">
                      <summary>
                        Words made plain ({result.changes.length})
                      </summary>
                      <p className="change-list">
                        {result.changes
                          .map((c) => `${c.from} to ${c.to}`)
                          .join(", ")}
                      </p>
                    </details>
                  )}
                  <div className="actions">
                    <button
                      type="button"
                      className="btn primary"
                      onClick={handleSave}
                    >
                      Save to library
                    </button>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={handleCopy}
                    >
                      Copy text
                    </button>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => {
                        if (result) {
                          setInput(result.text);
                          setResult(null);
                          flash("Clear version loaded. You can run it again.");
                        }
                      }}
                    >
                      Edit this version
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {view === "read" && (
          <section className="reader-layout">
            <div className="panel glass controls">
              <h2>Reading controls</h2>
              <label className="field-label" htmlFor="pick-lesson">
                Lesson
              </label>
              <select
                id="pick-lesson"
                className="text-input"
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
              </select>

              <label className="field-label" htmlFor="font-size">
                Text size: {settings.size}px
              </label>
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
              />

              <label className="field-label" htmlFor="line-spacing">
                Line spacing: {settings.spacing.toFixed(1)}
              </label>
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
              />

              <span className="field-label">Page style</span>
              <div className="seg" role="group" aria-label="Page style">
                {[
                  ["paper", "Paper"],
                  ["night", "Night"],
                  ["contrast", "High contrast"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={settings.theme === key ? "seg-btn active" : "seg-btn"}
                    onClick={() => setSettings({ ...settings, theme: key })}
                    aria-pressed={settings.theme === key}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <span className="field-label">Listen</span>
              <div className="actions wrap-actions">
                {!speaking ? (
                  <button type="button" className="btn primary" onClick={speak}>
                    Read aloud
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn primary"
                      onClick={togglePause}
                    >
                      {paused ? "Resume" : "Pause"}
                    </button>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={stopSpeak}
                    >
                      Stop
                    </button>
                  </>
                )}
              </div>
              <label className="field-label" htmlFor="speech-rate">
                Voice speed: {settings.rate.toFixed(1)}x
              </label>
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
              />
              <p className="hint small">
                Tip: tap any paragraph to focus on it. Tap it again to show
                everything.
              </p>
              <button
                type="button"
                className="btn ghost"
                onClick={() => window.print()}
              >
                Print this lesson
              </button>
            </div>

            <article
              className={`reading-page theme-${settings.theme}`}
              style={{
                fontSize: `${settings.size}px`,
                lineHeight: settings.spacing,
              }}
            >
              {activeLesson ? (
                <>
                  <h2>{activeLesson.title}</h2>
                  <p className="reading-meta">
                    Reading level grade {activeLesson.grade} - about{" "}
                    {textStats(activeLesson.text).minutes} min read
                  </p>
                  {activeLesson.text.split(/\n\s*\n/).map((p, i) => (
                    <p
                      key={i}
                      className={
                        focusPara === null || focusPara === i
                          ? "para"
                          : "para dim"
                      }
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
          </section>
        )}

        {view === "library" && (
          <section className="panel glass library">
            <div className="library-head">
              <div>
                <h2>My offline library</h2>
                <p className="hint">
                  Lessons are saved on this device only. No account, no
                  internet needed. They stay here when the signal drops.
                </p>
              </div>
              <div className="actions">
                <input
                  className="text-input search"
                  type="search"
                  placeholder="Search lessons"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search lessons"
                />
                <button
                  type="button"
                  className="btn ghost"
                  onClick={exportAll}
                  disabled={lessons.length === 0}
                >
                  Download all (.txt)
                </button>
              </div>
            </div>
            {filtered.length === 0 ? (
              <p className="empty">
                No lessons match. Make a lesson clear and save it, and it
                will live here.
              </p>
            ) : (
              <div className="cards">
                {filtered.map((l) => {
                  const s = textStats(l.text);
                  return (
                    <article key={l.id} className="card glass-soft">
                      <h3>{l.title}</h3>
                      <p className="card-meta">
                        Grade {l.grade} - {s.words} words - about {s.minutes}{" "}
                        min - saved {formatDate(l.savedAt)}
                      </p>
                      <p className="card-preview">
                        {l.text.slice(0, 160)}
                        {l.text.length > 160 ? "..." : ""}
                      </p>
                      <div className="actions">
                        <button
                          type="button"
                          className="btn primary small-btn"
                          onClick={() => openInReader(l.id)}
                        >
                          Open and read
                        </button>
                        <button
                          type="button"
                          className="btn ghost small-btn"
                          onClick={() => deleteLesson(l.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="foot glass">
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
