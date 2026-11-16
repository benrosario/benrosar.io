import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_TOUR_MS,
  MOVE_THRESHOLD_PX,
  accumulateTravel,
  hasTravelledEnough,
  initialTravel,
  nextTourStep,
  remainingAfterPause,
  shouldStartTour,
  PANEL_MOTION_MS,
  PANEL_SHIFT_PX,
  panelMotionMode,
  sameBox,
  slideDirection,
  TOUR_FIT_QUERY,
  TOUR_MIN_HEIGHT_PX,
  TOUR_MIN_WIDTH_PX,
  tourRestMs,
} from "../lib/tab-intent.ts";

test("movement threshold ignores the baseline and zero-delta events", () => {
  let s = initialTravel;
  s = accumulateTravel(s, { x: 50, y: 50 }); // baseline (synthetic move on load)
  assert.equal(s.total, 0);
  assert.equal(hasTravelledEnough(s), false);
  for (let i = 0; i < 10; i++) s = accumulateTravel(s, { x: 50, y: 50 }); // repeated synthetic events
  assert.equal(s.total, 0);
  assert.equal(hasTravelledEnough(s), false);
});

test("movement threshold needs more than 4px of cumulative travel", () => {
  let s = accumulateTravel(initialTravel, { x: 0, y: 0 });
  s = accumulateTravel(s, { x: 3, y: 0 });
  s = accumulateTravel(s, { x: 3, y: 1 }); // total 4
  assert.equal(s.total, MOVE_THRESHOLD_PX);
  assert.equal(hasTravelledEnough(s), false);
  s = accumulateTravel(s, { x: 3, y: 2 }); // total 5
  assert.equal(hasTravelledEnough(s), true);
  // a custom threshold
  assert.equal(hasTravelledEnough(s, 10), false);
  // diagonal travel is euclidean
  const d = accumulateTravel(accumulateTravel(initialTravel, { x: 0, y: 0 }), { x: 3, y: 4 });
  assert.equal(d.total, 5);
});

test("tour visits tabs left to right, returns to the first and ends", () => {
  const n = 3;
  const seen = [0];
  let cur = 0;
  let done = false;
  while (!done) {
    const step = nextTourStep(n, cur);
    seen.push(step.index);
    cur = step.index;
    done = step.done;
  }
  assert.deepEqual(seen, [0, 1, 2, 0]);
  assert.deepEqual(nextTourStep(3, 0), { index: 1, done: false });
  assert.deepEqual(nextTourStep(3, 1), { index: 2, done: false });
  assert.deepEqual(nextTourStep(3, 2), { index: 0, done: true });
});

test("tour starting mid-list continues rightwards, then wraps to the first and ends", () => {
  assert.deepEqual(nextTourStep(3, 1), { index: 2, done: false });
  assert.deepEqual(nextTourStep(3, 2), { index: 0, done: true });
});

test("a single-tab list has nothing to tour", () => {
  assert.deepEqual(nextTourStep(1, 0), { index: 0, done: true });
  assert.deepEqual(nextTourStep(0, 0), { index: 0, done: true });
  assert.equal(shouldStartTour({ reducedMotion: false, finePointerHover: true, viewportWidth: 1400, viewportHeight: 900, tabCount: 1 }), false);
});

test("per-tab rest time falls back to the default", () => {
  assert.equal(tourRestMs(undefined), DEFAULT_TOUR_MS);
  assert.equal(tourRestMs(12_000), 12_000);
  assert.equal(tourRestMs(0), DEFAULT_TOUR_MS);
  assert.equal(tourRestMs(-5), DEFAULT_TOUR_MS);
  assert.equal(tourRestMs(Number.NaN), DEFAULT_TOUR_MS);
  const tabs = [{ tourMs: 5000 }, {}, { tourMs: 9000 }];
  assert.deepEqual(tabs.map((t) => tourRestMs(t.tourMs)), [5000, DEFAULT_TOUR_MS, 9000]);
});

test("tour eligibility: reduced motion, touch, and only in fit mode (wide and tall enough)", () => {
  const ok = { reducedMotion: false, finePointerHover: true, viewportWidth: 1280, viewportHeight: 720, tabCount: 3 };
  assert.equal(shouldStartTour(ok), true);
  assert.equal(shouldStartTour({ ...ok, reducedMotion: true }), false);
  assert.equal(shouldStartTour({ ...ok, finePointerHover: false }), false);
  assert.equal(shouldStartTour({ ...ok, viewportWidth: TOUR_MIN_WIDTH_PX - 1 }), false);
  assert.equal(shouldStartTour({ ...ok, viewportWidth: TOUR_MIN_WIDTH_PX }), true);
  assert.equal(shouldStartTour({ ...ok, viewportHeight: TOUR_MIN_HEIGHT_PX - 1 }), false);
  assert.equal(shouldStartTour({ ...ok, viewportHeight: TOUR_MIN_HEIGHT_PX }), true);
  assert.equal(shouldStartTour({ ...ok, viewportWidth: 1280, viewportHeight: 600 }), false); // short laptop window
  assert.equal(shouldStartTour({ ...ok, viewportWidth: 375, viewportHeight: 812 }), false); // phone
});

test("the fit-mode query string matches the numeric thresholds", () => {
  assert.equal(TOUR_FIT_QUERY, `(min-width: ${TOUR_MIN_WIDTH_PX}px) and (min-height: ${TOUR_MIN_HEIGHT_PX}px)`);
  assert.equal(TOUR_FIT_QUERY, "(min-width: 1000px) and (min-height: 660px)");
});

test("panel motion: crossfade only where panels fill the stage, nothing under reduced motion", () => {
  assert.equal(panelMotionMode({ reducedMotion: false, fit: true }), "crossfade");
  assert.equal(panelMotionMode({ reducedMotion: false, fit: false }), "enter");
  assert.equal(panelMotionMode({ reducedMotion: true, fit: true }), "none");
  assert.equal(panelMotionMode({ reducedMotion: true, fit: false }), "none");
  assert.equal(panelMotionMode({ reducedMotion: false, fit: true, hidden: true }), "none"); // no frames, no events
});

test("slide direction follows the tab order", () => {
  assert.equal(slideDirection(0, 2), 1);
  assert.equal(slideDirection(2, 0), -1);
  assert.equal(slideDirection(1, 0), -1);
  assert.equal(slideDirection(0, 1), 1);
});

test("same-box check ignores sub-pixel noise only", () => {
  assert.equal(sameBox(null, { x: 0, width: 10 }), false);
  assert.equal(sameBox({ x: 10, width: 100 }, { x: 10.01, width: 100 }), true);
  assert.equal(sameBox({ x: 10, width: 100 }, { x: 10.5, width: 100 }), false);
  assert.equal(sameBox({ x: 10, width: 100 }, { x: 10, width: 101 }), false);
});

test("motion constants are sane", () => {
  assert.ok(PANEL_MOTION_MS >= 200 && PANEL_MOTION_MS <= 300);
  assert.ok(PANEL_SHIFT_PX > 0 && PANEL_SHIFT_PX <= 24);
});

test("pausing keeps the unspent part of a rest period", () => {
  assert.equal(remainingAfterPause(7000, 2500), 4500);
  assert.equal(remainingAfterPause(7000, 9000), 0);
  assert.equal(remainingAfterPause(7000, -10), 7000);
});
