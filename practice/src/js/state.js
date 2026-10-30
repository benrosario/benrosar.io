// Shared mutable app state. Modules import `st` and read/write its fields; `st.save()` persists st.S.
export const st = {
  S: {},              // saved state (see store.js)
  save: () => {},
  bank: null,         // content bundle: {version, exams, collections, timed, prelude}
  views: {},          // resolved collections by id (model.resolveCollection)
  cid: null,          // selected collection id
  view: null,         // st.views[st.cid]
  cur: 0,             // index of the selected source exam in st.view.exams, or -1 on the home page (none selected)
  ptView: false,      // showing timed practice instead of the practice questions
  ptHist: null,       // submit time of a past attempt being reviewed, or null
  pgView: false,      // showing the playground (playground.js)
  pgWant: null,       // at startup: the playground file the URL asks for ('' for the last one used), or null
  gleam: null,        // {worker, base}: URLs of the Gleam checking worker and compiler assets
  py: null,           // {worker, base}: URLs of the Python worker and the Pyodide directory
  runtimes: null,     // each runtime's files and sizes, for the background download (runtimes.js)
};
// Per-collection navigation state: selected exam, filter, open sidebar groups, scroll position, timed length.
export const cs = () => st.S._cs[st.cid] || (st.S._cs[st.cid] = {});
