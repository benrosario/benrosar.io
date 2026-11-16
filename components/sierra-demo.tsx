"use client";
import "./sierra-demo.css";
import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useId,
  useRef,
  useState,
  type AnimationEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { REDUCED_MOTION_QUERY, TOUR_FIT_QUERY, VIEW_TRANSITION_MS, MOTION_SLACK_MS, panelMotionMode } from "@/lib/tab-intent";
import { ChatDemo, useDemoClientId } from "./chat-demo";
import { useTabActive } from "./project-tabs";
import { SampleChat } from "./sample-chat";

// The Sierra Class Helper tab: a recorded replay, and the live demo when it is available.
// Both views stay mounted, so a signed-in conversation survives switching views and tabs.
type View = "replay" | "live";
// `exiting` is the view that is only still on screen to animate out, `entering` the one animating in.
type Shown = { view: View; exiting: View | null; entering: View | null };
type DemoState = {
  clientId: string | null;
  shown: Shown;
  show: (view: View, moveFocus?: boolean) => void;
  settle: () => void;
  ids: { replay: string; live: string };
  liveRef: RefObject<HTMLDivElement | null>;
};

const DemoContext = createContext<DemoState | null>(null);

function useDemo(): DemoState {
  const state = useContext(DemoContext);
  if (!state) throw new Error("Sierra demo controls must be inside <SierraDemo>.");
  return state;
}

export function SierraDemo({ children }: { children: ReactNode }) {
  const clientId = useDemoClientId();
  const [shown, setShown] = useState<Shown>({ view: "replay", exiting: null, entering: null });
  const uid = useId();
  const liveRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View>("replay");

  const settle = useCallback(
    () => setShown((s) => (s.exiting || s.entering ? { view: s.view, exiting: null, entering: null } : s)),
    [],
  );

  const show = (next: View, moveFocus = false) => {
    const from = viewRef.current;
    if (next !== from) {
      viewRef.current = next;
      const mode = panelMotionMode({
        reducedMotion: window.matchMedia(REDUCED_MOTION_QUERY).matches,
        fit: window.matchMedia(TOUR_FIT_QUERY).matches,
        hidden: document.hidden,
      });
      setShown({
        view: next,
        entering: mode === "none" ? null : next,
        exiting: mode === "crossfade" ? from : null,
      });
    }
    if (moveFocus && next === "live") requestAnimationFrame(() => liveRef.current?.focus());
  };

  // The entering view ends the transition (see DemoViews); this is the fallback.
  // Reduced motion never enters the animated states, so nothing waits for an event.
  useEffect(() => {
    if (!shown.exiting && !shown.entering) return;
    const t = setTimeout(settle, VIEW_TRANSITION_MS + MOTION_SLACK_MS);
    return () => clearTimeout(t);
  }, [shown, settle]);

  return (
    <DemoContext
      value={{
        clientId,
        shown: clientId ? shown : { view: "replay", exiting: null, entering: null },
        show,
        settle,
        ids: { replay: `${uid}-replay`, live: `${uid}-live` },
        liveRef,
      }}
    >
      {children}
    </DemoContext>
  );
}

// Shown only when the live demo is available, so it never switches to nothing.
export function TryLiveLink() {
  const { clientId, show, ids } = useDemo();
  if (!clientId) return null;
  return (
    <p className="demo-link">
      <button
        type="button"
        className="text-link"
        aria-controls={ids.live}
        onClick={() => show("live", true)}
      >
        Try the live demo
      </button>
      <span>Sign in with Google. Three questions per account.</span>
    </p>
  );
}

export function SierraDemoStage() {
  const { clientId, shown, show, settle, ids, liveRef } = useDemo();
  const tabActive = useTabActive();
  const { view, exiting, entering } = shown;
  // A view is out of the tab order and the accessibility tree (inert + aria-hidden) from the
  // moment it stops being the current one, including while it is still fading out.
  const viewProps = (v: View) => ({
    hidden: view !== v && exiting !== v,
    "data-exiting": exiting === v ? "" : undefined,
    "data-entering": entering === v ? "" : undefined,
    "aria-hidden": view !== v ? true : undefined,
    inert: view !== v,
    onAnimationEnd: (e: AnimationEvent<HTMLElement>) => {
      if (entering === v && e.target === e.currentTarget) settle(); // not an animation inside the view
    },
  });
  return (
    <div className="demo-stage" data-view={view}>
      {clientId && (
        <div className="demo-switch" role="group" aria-label="Demo view">
          <button type="button" aria-pressed={view === "replay"} aria-controls={ids.replay} onClick={() => show("replay")}>
            Replay
          </button>
          <button type="button" aria-pressed={view === "live"} aria-controls={ids.live} onClick={() => show("live")}>
            Try it live
          </button>
        </div>
      )}
      <div className="demo-views">
        <section className="demo-view" data-kind="replay" id={ids.replay} aria-labelledby={`${ids.replay}-title`} {...viewProps("replay")}>
          <h3 id={`${ids.replay}-title`}>Watch it find a class</h3>
          <p className="sample-meta">
            A replay of a real reply from Discord on September 29, 2026. Instructor names are changed.
          </p>
          <SampleChat active={tabActive && view === "replay"} />
        </section>
        {clientId && (
          <div className="demo-view" data-kind="live" id={ids.live} tabIndex={-1} ref={liveRef} {...viewProps("live")}>
            <ChatDemo googleClientId={clientId} />
          </div>
        )}
      </div>
    </div>
  );
}
