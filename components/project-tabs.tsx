"use client";

import "./project-tabs.css";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  MOTION_SLACK_MS,
  PANEL_EASING,
  PANEL_MOTION_MS,
  PANEL_SHIFT_PX,
  REDUCED_MOTION_QUERY,
  TOUR_FIT_QUERY,
  TOUR_MEDIA_QUERY,
  TOUR_START_DELAY_MS,
  accumulateTravel,
  hasTravelledEnough,
  initialTravel,
  nextTourStep,
  panelMotionMode,
  remainingAfterPause,
  sameBox,
  shouldStartTour,
  slideDirection,
  tourRestMs,
  type Box,
  type TravelState,
} from "@/lib/tab-intent";

export type ProjectTab = {
  id: string;
  label: string; // always visible
  summary?: string; // one line, only on the selected tab when there is room
  stat?: string; // short figure like "40+ active users", when there is room
  tourMs?: number; // how long the auto-tour rests on this tab (default 7000)
  panel: ReactNode;
};

const TabActiveContext = createContext(true);

/** True when the panel this is rendered inside is the selected one. Panels stay mounted
 *  while hidden, so use this to pause or restart animations when the tab is shown. It turns
 *  true the moment a tab is selected and false for a panel that is only fading out. */
export function useTabActive(): boolean {
  return useContext(TabActiveContext);
}

type TourState = "idle" | "running" | "stopped";

/** One tab change: which panels move and which way. `exit` is false where the outgoing panel
 *  is simply taken away (panels that do not fill a fixed stage), see panelMotionMode(). */
type Motion = { seq: number; from: string; to: string; dir: 1 | -1; exit: boolean };
/** `exiting` is the one panel that is still on screen only to fade out. */
type View = { active: string; exiting: string | null; motion: Motion | null };

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),summary,[contenteditable=""],[contenteditable="true"],[tabindex]:not([tabindex="-1"])';

export function ProjectTabs({
  tabs,
  label,
  initialId,
  className,
}: {
  tabs: ProjectTab[];
  label: string; // aria-label of the tablist
  initialId?: string;
  className?: string;
}) {
  const uid = useId();
  const [view, setView] = useState<View>(() => ({
    active: tabs.some((t) => t.id === initialId) ? (initialId as string) : (tabs[0]?.id ?? ""),
    exiting: null,
    motion: null,
  }));
  const activeId = view.active;
  const exitingId = view.exiting;
  const [changed, setChanged] = useState(false); // after the first change: text may fade in
  const [tour, setTour] = useState<TourState>("idle");
  const [paused, setPaused] = useState(false);
  // The tour's progress bar is one element that rides on the highlight. It is replaced (so its
  // fill restarts) only when the tour itself advances, never by the user's own selections, so a
  // bar that is easing out after the user took over is not cut short.
  const [bar, setBar] = useState(() => ({
    run: 0,
    ms: tourRestMs(tabs.find((t) => t.id === activeId)?.tourMs),
  }));

  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const hlRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const panelRefs = useRef(new Map<string, HTMLDivElement>());
  const tabsRef = useRef(tabs);
  const activeRef = useRef(activeId);
  useEffect(() => {
    tabsRef.current = tabs;
    activeRef.current = activeId;
  });

  const tourEnded = useRef(false);
  const seqRef = useRef(0);
  const running = useRef(new Map<string, Animation>()); // panel animations in flight, by tab id
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const select = useCallback((id: string) => {
    const from = activeRef.current;
    if (id === from) return;
    const list = tabsRef.current;
    activeRef.current = id;
    setChanged(true);
    const mode = panelMotionMode({
      reducedMotion: window.matchMedia(REDUCED_MOTION_QUERY).matches,
      fit: window.matchMedia(TOUR_FIT_QUERY).matches,
      hidden: document.hidden,
    });
    const seq = ++seqRef.current;
    const motion: Motion | null =
      mode === "none"
        ? null
        : {
            seq,
            from,
            to: id,
            dir: slideDirection(
              list.findIndex((t) => t.id === from),
              list.findIndex((t) => t.id === id),
            ),
            exit: mode === "crossfade",
          };
    // A previous exiting panel, if any, is dropped here: at most one is ever on screen.
    setView({ active: id, exiting: motion?.exit ? from : null, motion });
  }, []);

  // ---- panel transitions ----------------------------------------------------
  // The incoming panel fades in while sliding from the side of travel; the outgoing one
  // (kept rendered as `exiting`, overlaid on the stage) fades out while sliding the other way.
  // Web Animations, so an interrupted panel continues from where it currently is instead of
  // jumping. Nothing is left to chance at the end: the animation's finish event ends the
  // exiting state, with a timeout as a fallback, and every new change cancels both.

  const settle = useCallback((seq: number) => {
    clearTimeout(settleTimer.current);
    setView((v) => (v.motion && v.motion.seq === seq ? { active: v.active, exiting: null, motion: null } : v));
  }, []);

  useLayoutEffect(() => {
    const motion = view.motion;
    clearTimeout(settleTimer.current);
    // Remember where interrupted panels are, then stop them.
    const where = new Map<string, { opacity: string; transform: string }>();
    running.current.forEach((anim, id) => {
      const el = panelRefs.current.get(id);
      if (el && !el.hidden) {
        const cs = getComputedStyle(el);
        where.set(id, { opacity: cs.opacity, transform: cs.transform });
      }
      anim.cancel();
    });
    running.current.clear();
    if (!motion) return;

    const incoming = panelRefs.current.get(motion.to);
    const outgoing = motion.exit ? panelRefs.current.get(motion.from) : undefined;
    const timing: KeyframeAnimationOptions = { duration: PANEL_MOTION_MS, easing: PANEL_EASING };
    const shift = motion.dir * PANEL_SHIFT_PX;
    let last: Animation | undefined;

    if (incoming && typeof incoming.animate === "function") {
      const at = where.get(motion.to);
      last = incoming.animate(
        [
          { opacity: at?.opacity ?? "0", transform: at?.transform ?? `translateX(${shift}px)` },
          { opacity: "1", transform: "translateX(0)" },
        ],
        timing,
      );
      running.current.set(motion.to, last);
    }
    if (outgoing && typeof outgoing.animate === "function") {
      const at = where.get(motion.from);
      last = outgoing.animate(
        [
          { opacity: at?.opacity ?? "1", transform: at?.transform ?? "translateX(0)" },
          { opacity: "0", transform: `translateX(${-shift}px)` },
        ],
        timing,
      );
      running.current.set(motion.from, last);
    }
    const seq = motion.seq;
    if (last) last.addEventListener("finish", () => settle(seq), { once: true });
    // Fallback if the finish event never comes (animation unsupported, tab in the background).
    settleTimer.current = setTimeout(() => settle(seq), (last ? PANEL_MOTION_MS : 0) + MOTION_SLACK_MS);
  }, [view.motion, settle]);

  useEffect(() => {
    const anims = running.current;
    return () => {
      clearTimeout(settleTimer.current);
      anims.forEach((a) => a.cancel());
      anims.clear();
    };
  }, []);

  // ---- highlight behind the selected tab --------------------------------------
  // One absolutely positioned element, moved with transform/width to the box measured from
  // the selected tab. Selection changes glide; everything else that moves a tab (container
  // resize, container-query tiers, font loading) is re-measured and applied instantly.
  // Until the first measurement the selected tab paints its own highlight (see
  // data-hl in the stylesheet), so server HTML and first paint already look selected.

  const lastBox = useRef<Box | null>(null);
  const measure = useCallback((glide: boolean) => {
    const hl = hlRef.current;
    const track = trackRef.current;
    const tab = tabRefs.current.get(activeRef.current);
    if (!hl || !track || !tab) return;
    const t = track.getBoundingClientRect();
    const r = tab.getBoundingClientRect();
    if (r.width === 0) return; // not laid out
    const box: Box = { x: r.left - t.left, width: r.width };
    if (sameBox(lastBox.current, box)) return; // e.g. observer echoes of a selection change
    const animate = glide && lastBox.current !== null; // the very first placement never glides
    lastBox.current = box;
    if (!animate) hl.style.transition = "none";
    hl.style.transform = `translateX(${box.x}px)`;
    hl.style.width = `${box.width}px`;
    if (!animate) {
      void hl.offsetWidth; // commit the jump before transitions come back
      hl.style.transition = "";
    }
    rootRef.current?.setAttribute("data-hl", "ready");
  }, []);

  useLayoutEffect(() => {
    measure(true);
  }, [activeId, measure]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const ro = new ResizeObserver(() => measure(false));
    ro.observe(track);
    tabRefs.current.forEach((el) => ro.observe(el));
    const onFonts = () => measure(false);
    const fonts = document.fonts;
    fonts?.addEventListener?.("loadingdone", onFonts);
    return () => {
      ro.disconnect();
      fonts?.removeEventListener?.("loadingdone", onFonts);
    };
  }, [measure]);

  // ---- click and keyboard -------------------------------------------------

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const list = tabsRef.current;
    if (list.length === 0) return;
    const current = list.findIndex((t) => tabRefs.current.get(t.id) === document.activeElement);
    const from = current === -1 ? list.findIndex((t) => t.id === activeRef.current) : current;
    let next = -1;
    if (e.key === "ArrowRight") next = (from + 1) % list.length;
    else if (e.key === "ArrowLeft") next = (from - 1 + list.length) % list.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = list.length - 1;
    if (next === -1) return;
    e.preventDefault();
    const id = list[next].id;
    select(id); // automatic activation
    tabRefs.current.get(id)?.focus();
  };

  // ---- panels are focusable only if they contain nothing focusable ---------

  useEffect(() => {
    const el = panelRefs.current.get(activeId);
    const update = () => {
      panelRefs.current.forEach((panel, id) => {
        const wants = id === activeId && !panel.querySelector(FOCUSABLE);
        if (wants) panel.setAttribute("tabindex", "0");
        else panel.removeAttribute("tabindex");
      });
    };
    update();
    if (!el) return;
    const mo = new MutationObserver(update);
    mo.observe(el, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [activeId]);

  // ---- auto tour -----------------------------------------------------------

  useEffect(() => {
    if (tourEnded.current) return;
    const list = tabsRef.current;
    if (
      !shouldStartTour({
        reducedMotion: window.matchMedia(REDUCED_MOTION_QUERY).matches,
        finePointerHover: window.matchMedia(TOUR_MEDIA_QUERY).matches,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        tabCount: list.length,
      })
    )
      return;

    const root = rootRef.current;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let action: (() => void) | null = null; // what fires when the current wait ends
    let remaining = 0;
    let startedAt = 0;
    let index = 0;
    let travel: TravelState = initialTravel;
    let stopped = false;

    const arm = (ms: number, fn: () => void) => {
      action = fn;
      remaining = ms;
      clearTimeout(timer);
      if (document.hidden) {
        setPaused(true);
        return;
      }
      startedAt = performance.now();
      timer = setTimeout(fn, ms);
    };

    const rest = () => arm(tourRestMs(list[index]?.tourMs), advance);

    function advance() {
      const step = nextTourStep(list.length, index);
      index = step.index;
      select(list[index].id); // selection only: no focus change, no announcements
      if (step.done) {
        stop(); // the bar (full) and the hint ease out while the highlight returns to the first tab
      } else {
        const ms = tourRestMs(list[index].tourMs);
        setBar((b) => ({ run: b.run + 1, ms })); // a fresh bar
        rest();
      }
    }

    const stop = () => {
      if (stopped) return;
      stopped = true;
      tourEnded.current = true;
      clearTimeout(timer);
      detach();
      setPaused(false);
      setTour("stopped"); // the bar freezes where it is; CSS eases it and the hint out
    };

    const onVisibility = () => {
      if (stopped || !action) return;
      if (document.hidden) {
        clearTimeout(timer);
        remaining = remainingAfterPause(remaining, performance.now() - startedAt);
        setPaused(true);
      } else {
        setPaused(false);
        arm(remaining, action);
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      travel = accumulateTravel(travel, { x: e.clientX, y: e.clientY });
      if (hasTravelledEnough(travel)) stop();
    };

    const stopEvents = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    const opts = { capture: true, passive: true } as const;
    const attach = () => {
      window.addEventListener("pointermove", onPointerMove, opts);
      stopEvents.forEach((n) => window.addEventListener(n, stop, opts));
      root?.addEventListener("focusin", stop);
      document.addEventListener("visibilitychange", onVisibility);
    };
    const detach = () => {
      window.removeEventListener("pointermove", onPointerMove, opts);
      stopEvents.forEach((n) => window.removeEventListener(n, stop, opts));
      root?.removeEventListener("focusin", stop);
      document.removeEventListener("visibilitychange", onVisibility);
    };

    attach();
    arm(TOUR_START_DELAY_MS, () => {
      index = Math.max(0, list.findIndex((t) => t.id === activeRef.current));
      setTour("running"); // the hint and the first bar ease in (transitions on the same elements)
      rest();
    });

    return () => {
      stopped = true;
      clearTimeout(timer);
      detach();
    };
  }, [select]);

  const activeIndex = tabs.findIndex((t) => t.id === activeId);
  const tabId = (id: string) => `${uid}-tab-${id}`;
  const panelId = (id: string) => `${uid}-panel-${id}`;

  return (
    <div
      ref={rootRef}
      className={className ? `ptabs-root ${className}` : "ptabs-root"}
      data-tour={tour}
      data-paused={paused ? "" : undefined}
      data-changed={changed ? "" : undefined}
      data-first={activeIndex === 0 ? "" : undefined}
      data-last={activeIndex === tabs.length - 1 ? "" : undefined}
    >
      <div className="ptabs-strip">
        {/* Visual-only hint; its row is always reserved so hiding it moves nothing. */}
        <p className="ptabs-hint" aria-hidden="true">
          <span className="ptabs-hint-dot" />
          Touring my projects. Move your cursor or press a key to stop.
        </p>
        <div ref={trackRef} className="ptabs-track">
          {/* The selected tab's highlight (and the tour bar riding on it); see measure(). */}
          <span ref={hlRef} className="ptabs-hl" aria-hidden="true">
            <span
              key={bar.run}
              className="ptabs-bar"
              style={{ "--ptabs-rest": `${bar.ms}ms` } as CSSProperties}
            />
          </span>
          <div className="ptabs-list" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
            {tabs.map((tab) => {
              const selected = tab.id === activeId;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    if (el) tabRefs.current.set(tab.id, el);
                    else tabRefs.current.delete(tab.id);
                  }}
                  type="button"
                  role="tab"
                  id={tabId(tab.id)}
                  className="ptabs-tab"
                  aria-selected={selected}
                  aria-controls={panelId(tab.id)}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(tab.id)}
                >
                  <span className="ptabs-label">{tab.label}</span>
                  {(tab.stat || tab.summary) && (
                    <span className="ptabs-sub">
                      {tab.stat && <span className="ptabs-stat">{tab.stat}</span>}
                      {tab.summary && <span className="ptabs-summary">{tab.summary}</span>}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="ptabs-stage">
        {tabs.map((tab) => {
          const selected = tab.id === activeId;
          const exiting = tab.id === exitingId;
          return (
            <div
              key={tab.id}
              ref={(el) => {
                if (el) panelRefs.current.set(tab.id, el);
                else panelRefs.current.delete(tab.id);
              }}
              role="tabpanel"
              id={panelId(tab.id)}
              aria-labelledby={tabId(tab.id)}
              className="ptabs-panel"
              hidden={!selected && !exiting}
              data-exiting={exiting ? "" : undefined}
              aria-hidden={exiting ? true : undefined}
              inert={exiting}
            >
              <TabActiveContext value={selected}>{tab.panel}</TabActiveContext>
            </div>
          );
        })}
      </div>
    </div>
  );
}
