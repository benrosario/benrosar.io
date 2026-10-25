"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
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
const REPLAY_SEEN_KEY = "sierra-class-helper-replay-seen";
const REPLAY_SEEN_EVENT = "sierra-class-helper-replay-seen";
// Walks the reply in reading order, handing out one index per word so the
// stream can reveal words in sequence. Hidden words retain their space so
// playback never shifts the page or needs to control the visitor's scroll.
class Cursor {
  n = 0;
  shown: number;
  animate: boolean;
  constructor(shown: number, animate: boolean) {
    this.shown = shown;
    this.animate = animate;
  }
  words(text: string): ReactNode[] {
    return (text.match(/\s*\S+\s*/g) ?? []).map((word) => {
      const index = this.n++;
      const hidden = index >= this.shown;
      return <span
        key={index}
        className={this.animate && !hidden ? "stream-word" : undefined}
        style={hidden ? { visibility: "hidden" } : undefined}
        aria-hidden={hidden || undefined}
      >{word}</span>;
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
  for (const course of COURSES) renderCourse(course, c);
  return c.n;
}

function renderCourse(course: Course, c: Cursor): ReactNode {
  const title = c.words(course.title);
  return (
    <div className="replay-course">
      <h5>{title}</h5>
      <ul>
        {course.items.map((item) => {
          const revealed = c.n < c.shown;
          const label = c.words(`${item.label}:`);
          const value = c.runs(item.runs);
          return (
            <li key={item.label} style={revealed ? undefined : { visibility: "hidden" }} aria-hidden={!revealed || undefined}>
              <strong>{label}</strong> {value}
              {item.sub && (
                <ul>
                  {item.sub.map((line) => {
                    const revealed = c.n < c.shown;
                    return <li key={line} style={revealed ? undefined : { visibility: "hidden" }} aria-hidden={!revealed || undefined}>{c.words(line)}</li>;
                  })}
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

function hasSeenReplay() {
  // Prefer the complete example if autoplay or persistence is unavailable.
  if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") return true;
  try {
    return localStorage.getItem(REPLAY_SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

function subscribeToReplayVisit(notify: () => void) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  window.addEventListener("storage", notify);
  window.addEventListener(REPLAY_SEEN_EVENT, notify);
  motion.addEventListener("change", notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(REPLAY_SEEN_EVENT, notify);
    motion.removeEventListener("change", notify);
  };
}

function rememberReplay() {
  try {
    localStorage.setItem(REPLAY_SEEN_KEY, "1");
    window.dispatchEvent(new Event(REPLAY_SEEN_EVENT));
  } catch {
    // Manual playback still works if saving the preference is blocked.
  }
}

export function SampleChat() {
  const [playing, setPlaying] = useState(false);
  const [shown, setShown] = useState(TOTAL_WORDS);
  const [expanded, setExpanded] = useState(false);
  const [hasReplayed, setHasReplayed] = useState(false);
  const frame = useRef<number | null>(null);
  const question = useRef<HTMLParagraphElement | null>(null);
  // Server HTML remains readable without JavaScript; hydration checks this browser's visit.
  const seenReplay = useSyncExternalStore(subscribeToReplayVisit, hasSeenReplay, () => true);
  const waiting = !seenReplay && !hasReplayed && !playing;

  const stop = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);
  useEffect(() => stop, [stop]);

  const startPlayback = useCallback(() => {
    stop();
    setHasReplayed(true);
    rememberReplay();
    setPlaying(true);
    setShown(0);
    const start = performance.now();
    const tick = (now: number) => {
      const next = Math.min(TOTAL_WORDS, Math.floor(((now - start) / 1000) * WORDS_PER_SECOND) + 1);
      setShown(next);
      if (next < TOTAL_WORDS) frame.current = requestAnimationFrame(tick);
      else { frame.current = null; setPlaying(false); }
    };
    frame.current = requestAnimationFrame(tick);
  }, [stop]);

  useEffect(() => {
    if (!waiting || !question.current) return;
    let active = true;
    const observer = new IntersectionObserver((entries) => {
      if (!active || !entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.75)) return;
      active = false;
      observer.disconnect();
      startPlayback();
    }, { threshold: 0.75, rootMargin: "-80px 0px -32px 0px" });
    observer.observe(question.current);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [waiting, startPlayback]);

  const replay = () => {
    if (playing || prefersReducedMotion()) {
      stop();
      setShown(TOTAL_WORDS);
      setPlaying(false);
      return;
    }
    startPlayback();
  };

  const c = new Cursor(waiting ? 0 : shown, playing);
  const playbackLabel = playing ? "Skip replay" : waiting ? "Watch response" : "Replay response";
  const hideDetails = waiting || playing;

  return (
    <div className="replay" data-phase={playing ? "streaming" : waiting ? "waiting" : "done"}>
      <div className="replay-bar">
        <span className="replay-avatar" aria-hidden="true"><History /></span>
        <span className="replay-name"><span>Sierra Class Helper</span> <span className="replay-name-tag">— Replay</span></span>
        <button type="button" className="replay-again" onClick={replay} aria-label={playbackLabel}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 9.5a5.5 5.5 0 1 0 1.7-4M4.5 3.5v3h3" /></svg>
          <span className="replay-again-label" aria-hidden="true">{playbackLabel}</span>
        </button>
      </div>

      <div className="replay-log">
        <p className="replay-question" ref={question}><span className="sr-only">Question: </span>{QUESTION}</p>
        <div className="replay-answer">
          <p className="replay-from">Sierra Class Helper <span>4:12 PM</span></p>
          <p>{c.runs(INTRO)}</p>
          {renderCourse(COURSES[0], c)}
          <div className="replay-more" data-open={expanded} id="replay-more" inert={!expanded}>
            <div>
              {renderCourse(COURSES[1], c)}
              <div style={hideDetails ? { visibility: "hidden" } : undefined} aria-hidden={hideDetails || undefined} inert={hideDetails}>
                <p className="replay-updated">Classes last updated: 16:04 PDT (8 minutes ago)</p>
                <p className="replay-disclaimer">
                  AI can make mistakes. Verify important information on the{" "}
                  <a href="https://www.sierracollege.edu" target="_blank" rel="noopener noreferrer">
                    official Sierra College website
                  </a>.
                </p>
              </div>
            </div>
          </div>
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
        </div>
      </div>
      <span className="sr-only" role="status">{hasReplayed ? playing ? "Playing recorded response." : "Replay finished." : ""}</span>
    </div>
  );
}
