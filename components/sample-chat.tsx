"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { History } from "./icons";

// A replay of a real Sierra Class Helper reply from Discord (September 29, 2026).
// The reply is copied word for word except instructor names, which are
// replaced with made-up ones. The question is lightly reworded for clarity. Nothing here calls the bot.
type Run = string | { b: string } | { i: string };
type Item = { label: string; runs: Run[]; sub?: string[] };
type Course = { title: string; items: Item[] };

const QUESTION = "What are two Calculus 2 classes in Fall?";

const INTRO: Run[] = [
  "Here are ", { b: "2 Fall 2026 Calculus II courses" },
  " at Sierra College. Both began instruction on ", { b: "August 17, 2026" },
  " and are ", { b: "in progress as of September 29, 2026" }, ".",
];

const COURSES: Course[] = [
  {
    title: "1. Analytical Geom/Calculus II (MATH0031)",
    items: [
      { label: "CRN", runs: ["84233"] },
      { label: "Campus", runs: ["Nevada County Campus (Grass Valley/Tahoe-Truckee)"] },
      { label: "Instructor", runs: ["Dana R. Whitfield (RateMyProfessors: 4.1/5, 44 ratings, 69% would take again)"] },
      { label: "Dates", runs: ["August 17–December 12, 2026 — ", { b: "In progress" }] },
      { label: "Meeting", runs: ["Monday and Wednesday, 8:45–10:50am"] },
      { label: "Location", runs: ["N7101, Classroom/Lab Building"] },
      { label: "Enrollment", runs: ["6/24 enrolled; 18 seats available"] },
      { label: "Waitlist", runs: ["0/20"] },
    ],
  },
  {
    title: "2. Analytical Geom/Calculus II (MATH0031)",
    items: [
      { label: "CRN", runs: ["81259"] },
      { label: "Campus", runs: ["Rocklin Campus"] },
      {
        label: "Instructors", runs: [],
        sub: [
          "Elena M. Castillo (RateMyProfessors: 4.5/5, 227 ratings, 82% would take again)",
          "Owen T. Harper (RateMyProfessors: 3.4/5, 288 ratings, 43% would take again)",
        ],
      },
      { label: "Dates", runs: ["August 17–December 12, 2026 — ", { b: "In progress" }] },
      { label: "Meeting", runs: ["Monday and Wednesday, 2:00–4:05pm"] },
      { label: "Location", runs: ["V324, Math & Technology Center"] },
      { label: "Enrollment", runs: ["22/35 enrolled; 13 seats available"] },
      { label: "Waitlist", runs: ["0/20"] },
    ],
  },
];

// Words revealed per second while the reply "types". Chosen to read as a
// quick, steady stream rather than a letter-by-letter typewriter.
const WORDS_PER_SECOND = 32;
const THINKING_MS = 900;

type Phase = "idle" | "thinking" | "streaming" | "done";

// Walks the reply in reading order, handing out one index per word so the
// stream can reveal words in sequence. Anything past `shown` is not rendered.
class Cursor {
  n = 0;
  shown: number;
  animate: boolean;
  constructor(shown: number, animate: boolean) {
    this.shown = shown;
    this.animate = animate;
  }
  get open() { return this.n < this.shown; }
  words(text: string): ReactNode[] {
    return (text.match(/\s*\S+\s*/g) ?? []).map((word) => {
      const index = this.n++;
      if (index >= this.shown) return null;
      return this.animate
        ? <span className="stream-word" key={index}>{word}</span>
        : <span key={index}>{word}</span>;
    });
  }
  runs(runs: Run[]): ReactNode[] {
    return runs.map((run, i) => {
      if (typeof run === "string") return <span key={i}>{this.words(run)}</span>;
      if ("b" in run) return <strong key={i}>{this.words(run.b)}</strong>;
      return <em key={i}>{this.words(run.i)}</em>;
    });
  }
}

function countWords(): number {
  const c = new Cursor(Infinity, false);
  c.runs(INTRO);
  renderCourse(COURSES[0], c);
  return c.n;
}

function renderCourse(course: Course, c: Cursor): ReactNode {
  if (!c.open) return null;
  const title = c.words(course.title);
  return (
    <div className="replay-course">
      <h5>{title}</h5>
      <ul>
        {course.items.map((item) => {
          if (!c.open) return null;
          const label = c.words(`${item.label}:`);
          const value = c.runs(item.runs);
          return (
            <li key={item.label}>
              <strong>{label}</strong> {value}
              {item.sub && (
                <ul>
                  {item.sub.map((line) => c.open ? <li key={line}>{c.words(line)}</li> : null)}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const TOTAL_WORDS = countWords();

function prefersReducedMotion() {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SampleChat() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [shown, setShown] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [run, setRun] = useState(0);
  const frame = useRef<number | null>(null);
  const timer = useRef<number | null>(null);

  const stop = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    if (timer.current !== null) clearTimeout(timer.current);
    frame.current = timer.current = null;
  };
  useEffect(() => stop, []);

  const send = (event?: FormEvent) => {
    event?.preventDefault();
    if (phase !== "idle") return;
    if (prefersReducedMotion()) {
      setShown(TOTAL_WORDS);
      setPhase("done");
      return;
    }
    setPhase("thinking");
    timer.current = window.setTimeout(() => {
      setPhase("streaming");
      const start = performance.now();
      const tick = (now: number) => {
        const next = Math.min(TOTAL_WORDS, Math.floor(((now - start) / 1000) * WORDS_PER_SECOND) + 1);
        setShown(next);
        if (next < TOTAL_WORDS) frame.current = requestAnimationFrame(tick);
        else { frame.current = null; setPhase("done"); }
      };
      frame.current = requestAnimationFrame(tick);
    }, THINKING_MS);
  };

  const replay = () => {
    stop();
    setShown(0);
    setExpanded(false);
    setPhase("idle");
    setRun((r) => r + 1);
  };

  const sent = phase !== "idle";
  const done = phase === "done";
  const c = new Cursor(shown, true);

  return (
    <div className="replay" data-phase={phase} aria-busy={phase === "thinking" || phase === "streaming"}>
      <div className="replay-bar">
        <span className="replay-avatar" aria-hidden="true"><History /></span>
        <span className="replay-name"><span>Sierra Class Helper</span> <span className="replay-name-tag">— Replay</span></span>
        {done && (
          <button type="button" className="replay-again" onClick={replay} aria-label="Play again">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 9.5a5.5 5.5 0 1 0 1.7-4M4.5 3.5v3h3" /></svg>
            <span className="replay-again-label" aria-hidden="true">Play again</span>
          </button>
        )}
      </div>

      <div className="replay-log" key={run}>
        {!sent && (
          <p className="replay-hint">
            Press send to see how the bot answers.
          </p>
        )}
        {sent && <p className="replay-question"><span className="sr-only">Question: </span>{QUESTION}</p>}
        {phase === "thinking" && (
          <p className="replay-thinking" role="status">
            <span className="sr-only">Sierra Class Helper is typing</span>
            <i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" />
          </p>
        )}
        {(phase === "streaming" || done) && (
          <div className="replay-answer">
            <p className="replay-from">Sierra Class Helper <span>4:12 PM</span></p>
            <p>{c.runs(INTRO)}</p>
            {renderCourse(COURSES[0], c)}
            <div className="replay-more" data-open={expanded} id="replay-more" inert={!expanded}>
              <div>
                {renderCourse(COURSES[1], new Cursor(Infinity, false))}
                <p className="replay-updated">Classes last updated: 16:04 PDT (8 minutes ago)</p>
                <p className="replay-disclaimer">
                  AI can make mistakes. Verify important information on the{" "}
                  <a href="https://www.sierracollege.edu" target="_blank" rel="noopener noreferrer">
                    official Sierra College website
                  </a>.
                </p>
              </div>
            </div>
            {done && (
              <button
                type="button"
                className="replay-toggle"
                aria-expanded={expanded}
                aria-controls="replay-more"
                onClick={() => setExpanded((open) => !open)}
              >
                {expanded ? "Show less" : "Show the full reply"}
                <span aria-hidden="true" className="replay-chevron" />
              </button>
            )}
          </div>
        )}
        {done && <p className="sr-only" role="status">Sierra Class Helper replied.</p>}
      </div>

      <form className="replay-composer" onSubmit={send}>
        <label className="sr-only" htmlFor="replay-question">Example question</label>
        <input
          id="replay-question"
          readOnly
          value={sent ? "" : QUESTION}
          tabIndex={-1}
        />
        <button type="submit" disabled={sent} aria-label="Send the example question">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10 4.5 15.5 10 10 15.5" /></svg>
        </button>
      </form>
    </div>
  );
}
