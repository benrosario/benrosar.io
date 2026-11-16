// Pure, DOM-free decisions behind the auto tour in components/project-tabs.tsx
// (eligibility, stepping, rest times, pointer-movement threshold), so they can be
// unit tested with node.

export type Point = { x: number; y: number };

/* Tunables. Times in ms, distances in px. */
export const TOUR_START_DELAY_MS = 1200; // after mount, before the tour begins
export const DEFAULT_TOUR_MS = 7000; // rest time per tab when a tab has no tourMs
export const MOVE_THRESHOLD_PX = 4; // cumulative pointer travel that counts as "the user moved"
// The tour runs only in the homepage's one-screen "fit mode", where the tabs are always on
// screen. Keep in step with the fit-mode media query in app/globals.css.
export const TOUR_MIN_WIDTH_PX = 1000;
export const TOUR_MIN_HEIGHT_PX = 660;
export const TOUR_FIT_QUERY = `(min-width: ${TOUR_MIN_WIDTH_PX}px) and (min-height: ${TOUR_MIN_HEIGHT_PX}px)`;
export const TOUR_MEDIA_QUERY = "(hover: hover) and (pointer: fine)";
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/* Panel and view transitions (components/project-tabs.tsx, components/sierra-demo.tsx).
   The highlight glide and the tour bar/hint fades are CSS (components/project-tabs.css). */
export const PANEL_MOTION_MS = 240; // incoming and outgoing panel, overlapped
export const PANEL_SHIFT_PX = 16; // how far each panel slides
export const PANEL_EASING = "ease-out";
export const MOTION_SLACK_MS = 140; // timeout fallback fires this long after the nominal end
export const VIEW_FADE_MS = 200; // Replay / Try it live crossfade

/* ---------- real movement ---------- */

export type TravelState = { last: Point | null; total: number };
export const initialTravel: TravelState = { last: null, total: 0 };

/** Accumulate pointer travel. The first sample is only a baseline, and a sample at the same
 *  coordinates (a synthetic move when the cursor is at rest) adds nothing. */
export function accumulateTravel(state: TravelState, next: Point): TravelState {
  if (!state.last) return { last: next, total: 0 };
  const dx = next.x - state.last.x;
  const dy = next.y - state.last.y;
  const d = Math.hypot(dx, dy);
  if (d === 0) return state;
  return { last: next, total: state.total + d };
}

export function hasTravelledEnough(state: TravelState, threshold: number = MOVE_THRESHOLD_PX): boolean {
  return state.total > threshold;
}

/* ---------- auto tour ---------- */

export type TourEligibility = {
  reducedMotion: boolean;
  finePointerHover: boolean; // matchMedia(TOUR_MEDIA_QUERY).matches
  viewportWidth: number;
  viewportHeight: number;
  tabCount: number;
};

export function shouldStartTour(e: TourEligibility): boolean {
  return (
    !e.reducedMotion &&
    e.finePointerHover &&
    e.viewportWidth >= TOUR_MIN_WIDTH_PX &&
    e.viewportHeight >= TOUR_MIN_HEIGHT_PX &&
    e.tabCount > 1
  );
}

export type TourStep = { index: number; done: boolean };

/** After resting on `current`, which tab is shown next. Past the last tab the tour returns
 *  to the first tab and ends (one pass only). */
export function nextTourStep(tabCount: number, current: number): TourStep {
  if (tabCount <= 1) return { index: 0, done: true };
  if (current + 1 < tabCount) return { index: current + 1, done: false };
  return { index: 0, done: true };
}

export function tourRestMs(tourMs: number | undefined): number {
  return typeof tourMs === "number" && Number.isFinite(tourMs) && tourMs > 0 ? tourMs : DEFAULT_TOUR_MS;
}

/** Time left on a rest period that was paused `elapsed` ms in. */
export function remainingAfterPause(total: number, elapsed: number): number {
  return Math.max(0, total - Math.max(0, elapsed));
}

/* ---------- switching panels ---------- */

export type MotionMode = "none" | "enter" | "crossfade";

/** How a change of tab (or Replay/live view) is shown. Reduced motion: an instant swap, so
 *  nothing waits for an animation event (the same when the document is hidden). A crossfade needs the outgoing panel to overlay the
 *  incoming one, which is only clean where the panels fill a fixed-height stage (fit mode);
 *  elsewhere the panels have different natural heights and the page scrolls, so only the
 *  incoming panel animates. */
export function panelMotionMode(e: { reducedMotion: boolean; fit: boolean; hidden?: boolean }): MotionMode {
  // A hidden document does not render frames, so animations would never advance or finish.
  if (e.reducedMotion || e.hidden) return "none";
  return e.fit ? "crossfade" : "enter";
}

/** +1 when moving to a tab further right (content travels left), -1 when moving left. */
export function slideDirection(fromIndex: number, toIndex: number): 1 | -1 {
  return toIndex >= fromIndex ? 1 : -1;
}

/* ---------- highlight geometry ---------- */

export type Box = { x: number; width: number };

/** True when two measurements are the same box to within sub-pixel noise. */
export function sameBox(a: Box | null, b: Box, epsilon = 0.05): boolean {
  return !!a && Math.abs(a.x - b.x) < epsilon && Math.abs(a.width - b.width) < epsilon;
}
