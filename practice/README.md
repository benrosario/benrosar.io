# CS 61A practice site (practice.benrosar.io)

This is a static site of past CS 61A exam questions with Python checking, timed practice exams, study collections
and a Python and Gleam playground. It works offline after one visit.
Students choose what they're studying for (Midterm 1, Midterm 2, Midterm 3 or the comprehensive Final) with
the **Studying for** menu next to the question filter at the top of the sidebar, or with a link such as `?exam=midterm2`.

This folder is the canonical source. `practice/public/` is build output and is git-ignored.
`/Users/ben/Desktop/projects/exam-practice` is a generated local preview copy. Never edit either one by hand.

## Layout

```
practice/
  src/index.html         page shell (build fills in asset links)
  src/styles.css
  src/js/                app modules, bundled by esbuild into assets/app.<hash>.js
    main.js              boot: load content, migrate storage, start UI
    model.js             pure logic: collections, scope, progress, timed pools (shared with the Node tests)
    store.js             browser storage and the versioned migration
    practice.js          sidebar, questions, progress, resets
    timed.js             timed practice exams
    selector.js          "Studying for" (the collection in the URL)
    nav.js               Back and Forward: each view's URL and history entry, the ← → buttons and shortcuts
    sort.js              the Sort chips that order the sidebar's exams
    grading.js           answer checking (the Python worker for doctests and SQL, the Gleam worker for Gleam tests)
    runner.js            one job at a time per worker, with time limits and restarts
    py-worker.js         runs Python with the site's Pyodide (checks, and playground runs through src/py/run.py)
    gleam-worker.js, gleam-core.js  compiles and runs Gleam (official compiler, WebAssembly): checks and playground runs
    gleam-step.js        the playground's Debug for Gleam: probes in the source, then the compiled JavaScript (acorn)
    output.js            collects what a running program prints (both workers)
    runtimes.js          the background download of Python and Gleam
    offline.js           registers the service worker; the "Make available offline" button
    playground.js, editor.js  the playground and its code editor
    picker.js, problems.js    "Import a problem": the picker, and building a playground file from a problem
    feedback.js          the "Send feedback" dialog (posts to /f)
    chrome.js, highlight.js, ai.js, events.js, util.js, state.js
  src/py/run.py          runs a playground Python program (stdin, streamed output, tracebacks of its own lines)
  src/sw.js              the service worker (the build fills in its file list and writes public/sw.js)
  src/static/            copied as is (apple-touch-icon.jpg)
  content/exams/         source exams, each stored once (.json, or .mjs written with content/author.mjs)
  content/collections/   the four study options: scope rules, notes, picks, timed settings (index.json sets the order)
  content/timed/         modified problems for Midterm 3 timed practice
  content/python-prelude.py  Link, Tree and the doctest runner used to check Python answers
  content/COVERAGE.md    where each option's questions come from, what they cover, and the known gaps
  scripts/               build, validate, preview sync, staff topic import, Gleam and Python toolchains
                         (gleam-toolchain.mjs, pyodide-toolchain.mjs)
  tests/                 Node tests, the Python answer check, and browser tests (tests/ui)
  worker.js, wrangler.jsonc  deployment, the /e analytics endpoint and the /f feedback endpoint
```

## Commands (run from the `website/` folder)

| Command | What it does |
|---|---|
| `npm run practice:build` | Validates the content and builds `practice/public/`. It fails on any content error. |
| `npm run practice:serve` | Serves `practice/public/` at <http://localhost:8614>. |
| `npm run practice:test` | Runs the content, collection, migration, build/preview, Worker and playground tests (running programs, every importable problem), then runs every Python answer against its doctests (needs `python3`). |
| `npm run practice:test:ui` | Runs the browser tests in headless Chrome: switching, deep links, Back/Forward, unfinished answers, migration, timed attempts, grading, keyboard, mobile and themes, and (`tests/ui/playground.test.mjs`) the playground, importing problems, the timed-exam lock and offline use. Set `CHROME_PATH` if Chrome isn't in /Applications. Set `PRACTICE_SKIP_PYODIDE=1` to skip the tests that start Python. |
| `npm run practice:sync` | Builds, then refreshes the local preview copy in `../exam-practice`. It deletes only files an earlier sync wrote. |
| `npm run practice:check-preview` | Exits 1 if the preview copy doesn't match a fresh build. |
| `npm run deploy:practice` | Builds, runs `practice:test`, then deploys with wrangler. It deploys only after a clean build and passing tests. |

`node practice/scripts/build.mjs --allow-invalid` builds despite content errors. Use it only for work in progress.

## Content

- **Question ids.** A saved answer's key is `<exam id>|<question id>`. Problems have ids `<exam id>/<number>`. Never renumber them: progress is stored by these ids.
- **Exam blurbs.** Every exam opens with the same blurb: its title and instructors (`content/instructors.json`, by semester, from the course archive) or "Written by this site" for site-made sets; then the collection's `note` (only what the blurb can't work out itself, such as staff recommendations), skips and how much of the exam is shown; then, after a blank line, how out-of-scope questions count.
- **Collections.** Each collection can carry `advice` (course staff’s practice advice, shown on the home page under the coverage) and lists the source exams it uses, with `note`, staff `skip` text, `oos` (staff out of scope), `picks` (`dn` / `csm`), `tips` (a collection with `picksFrom` also gets those collections' picks and tips at build time: the Final combines Midterms 1–3), and `drop` / `keep` overrides with reasons. Scope comes from `scope.basis`: `staff` (explicit, Midterm 3) or `topics` (the staff topic tags must all be on `scope.topics`). A question shared by several collections counts toward each one where it's in scope.
- **Adding an exam.** Write `content/exams/<id>.mjs` with the helpers in `content/author.mjs`. Pass `run: true` so Python blanks are checked by doctests, and add the exam to the right collections. Then run `npm run practice:test`. The staff topic tags come from `scripts/annotate-topics.mjs` (JSON exams) or are written in the `.mjs`.
- **Restrictions.** An exam's rules about what an answer may contain ("You may not use and, or, or not") are enforced before an answer is matched or run (`RULES` in `content/enrich.mjs`); the build fails if an official answer breaks its own rule.
- **Checking.** Python blanks are compared with the accepted answers first, then run against the problem's doctests. Scheme and other non-executable blanks are compared as text while preserving capitalization and string contents; supported SQL blanks execute in SQLite, and the page says so. Multiple choice can list `also` (other choices the staff accepted).

## Gleam

Gleam replaced Scheme in Fall 2026 and is on the final. The course uses Gleam v1.18.1, compiled to JavaScript.

- **Checking answers.** Code answers in Gleam problems are compiled in the browser with the official Gleam compiler's WebAssembly build, the one Gleam's language tour uses. The problem's `*_test` functions then run, in the same `assert` style as the course's homework tests. "Evaluates to" questions compile `assert <expression> == <answer>`. The page shows compile errors and failed asserts, and stops infinite loops after 8 seconds.
- **Toolchain.** `scripts/gleam-toolchain.mjs` pins the compiler (1.18.1), `gleam_stdlib` (1.0.5) and the JavaScript prelude by SHA-256. It downloads them once into `practice/.cache/` (git-ignored), so the first build needs network.
- **What's served.** The build serves everything under `assets/gleam/<version>-stdlib-<version>/`: the compiler, the standard library's source (for type-checking), the standard library precompiled to JavaScript (what a compiled answer imports), and both Apache-2.0 licences. That's about 5 MB uncompressed, downloaded in the background (see Python, below). Both versions are in the path because browsers keep these files for good (`_headers`).
- **Text answers.** Gleam text answers are compared case-sensitively, preserving string contents and token boundaries, because `Ok` and `ok` differ.
- **Authoring.** Use `gl()` code blocks and one `glTests()` block (shown on the page as the tests), with `problem(..., {run: 'gleam'})`. Tie a code blank to a question with `blank(..., {r: 'x'})`, or write an "evaluates to" question with `blank(..., {ev: 'expression'})`.
- **Testing.** `npm run practice:test` compiles and runs every official and accepted answer with the same compiler in Node. It also checks that each problem's tests fail when a blank is left as `todo`.
- **Adapted problems.** These are Scheme problems this site rewrote in Gleam. They live in `content/exams/61a-fa26-gleam-adapted.mjs` and carry `adapted: {from, problem}`. The page labels them wherever they appear, including timed practice and copied AI prompts.

## Python

Python checks, SQL checks and the playground run CPython 3.12 in the browser with Pyodide 0.26.4, served by this site rather than a CDN.

- **Toolchain.** `scripts/pyodide-toolchain.mjs` pins the Pyodide core release, the `sqlite3` package and both licences (MPL-2.0 and the PSF licence) by SHA-256, and caches them in `practice/.cache/`. The build serves them under `assets/pyodide/<version>/`: about 15 MB uncompressed.
- **The worker.** `src/js/py-worker.js` (a classic worker, since Pyodide's loader uses `importScripts`) runs the prelude when it starts. Practice checks and the playground share it. `input()` outside a playground run raises `EOFError`.
- **Background download.** Once the page is idle, `src/js/runtimes.js` fetches Python's files and then Gleam's, one at a time at low priority, so the first check doesn't wait for 20 MB. It skips this for visitors with data saving on or a 2G connection, and in automated browsers (`?prefetch=1` forces it). When an exam with runnable Python, SQL or Gleam questions opens, that runtime starts in the background, but only once its files are downloaded.

## Playground

**Playground** in the header (or `?view=play`) replaces the questions with an editor where students write and run Python or Gleam. The sidebar is hidden while it's open.

- **Running.** Gleam compiles and runs about 300 ms after typing stops, like <https://playground.gleam.run>, with tabs for the output, the compiled JavaScript and the compiled Erlang. Python runs on **Run** (⌘↵ / Ctrl+Enter), or as you type with **Auto-run**; its stdin box feeds `input()`. **Run tests** runs Gleam's `*_test` functions and **Run doctests** Python's doctests. Output streams in, warnings and errors show under it, and runs stop after 10 seconds (or **Stop**).
- **Files.** A scratch file for each language, one per share link opened and one per imported problem. Each keeps its code, stdin, tab, cursor and scroll position in `localStorage['cs61a-playground-v1']`, saved as you type. Only the 30 most recently used files besides the scratch files are kept. **Reset** (asked first) goes back to the file's starting code; **Undo** (or ⌘Z) takes a reset back.
- **Share** copies a link with the code deflated into the URL's hash (`#py=…` / `#gleam=…`); opening it makes a new file and never overwrites anything.
- **Editor.** A textarea over the page's syntax highlighting. Tab and Shift+Tab indent and outdent (Escape, then Tab, leaves the editor), Enter keeps the indent, a closing bracket on an empty line outdents, ⌘/ comments lines. Edits go through `insertText`, so undo works.
- **Importing problems.** **Import problem** (⌘K / Ctrl+K anywhere) lists the problems with runnable code, by exam: the "Studying for" option's exams, or all of them, filtered by language; typing searches every exam's titles, text, code and topics. The arrow keys move (→ opens an exam, ← goes back up) and Enter chooses a problem. Then choose **Add to current playground** to append its code, or **Create new playground** to keep it separate. Imports do not change any code until a destination is chosen; adding to the current playground requires a matching language. The blanks are left as blanks (`____` in Python, `todo` in Gleam), filled with the student's answers (drafts first), or with the official solution immediately. Template blanks no question asks about get the official code, Gleam files get the problem's tests, and Python code that uses the course's `Link` or `Tree` gets those classes, and code that calls the tree functions (`tree`, `label`, `branches`) gets those. The problem's text shows above the editor, with **Replace code with** and **Open in practice**. Replacing code with Blanks, My answers or Solution requires confirmation; Cancel and Escape preserve the current code, and Undo remains available after replacement. Every practice problem has **Add to playground**, offering **Add to existing playground** or **Create new playground**. Choose Blanks, My answers or Solution before adding. Existing destinations are filtered by language and keep their current code; imports are appended. Problems without a grading template keep displayed Python or Gleam code executable; only prompts, explanations, expected outputs and other-language reference material become comments. Python interpreter prompts are removed. Problems with no supported code remain commented reference notes. Combined playgrounds retain their code rather than offering the single-problem refill controls.
- **Known template stub.** Fall 2023 Midterm 2 Q5's second part (`only_long_paths`) is an unfinished stub with no blanks; practice never runs it, but **Run doctests** in the playground reports its doctest as failing even with the solution.
- **Timed practice.** While an attempt is running (or being graded) the playground is locked: the header button, **Add to playground** and ⌘K are gone, and links or Back/Forward to it open the attempt.

## Back and Forward

Each view has its own URL and history entry (`src/js/nav.js`): an exam (`&x=<exam id>`), a problem jumped to from the sidebar (`&p=<number>`), the home page (`&view=home`), timed practice (`&view=timed`, `&attempt=<time>` for a past attempt) and each playground file (`&view=play&f=<file>`). A link with only `?exam=` opens the collection's last view, as before. Each entry remembers its scroll position, so Back returns to where you were and a reload reopens the same place.

The ← → buttons left of the title go back and forward within the site (disabled at either end). Shortcuts: ⌘[ ⌘] anywhere and ⌘← ⌘→ outside text fields on a Mac; Alt+← Alt+→ elsewhere. Where there's nowhere to go in the site, the browser does what it normally would.

## Offline use

After one visit the whole site works without a connection: questions, Python and SQL checks, Gleam and the playground. `src/sw.js` is the service worker:

- The page itself comes from the network when it answers within 3 seconds, so a deploy shows up as soon as there's a connection, and from the cache otherwise.
- The page's hashed files are cached when a version installs; the Python and Gleam files are cached as the background download fetches them, and kept until a deploy stops using that version.
- `/e`, `/f` and other sites are never touched. `_headers` makes browsers keep `/assets/*` for good and check `sw.js` on every visit.

**Make available offline** (the playground's toolbar and the home page) downloads whatever is missing, even when the background download was skipped, asks the browser to keep it, and then shows **Works offline**. Automated browsers don't register the service worker unless the URL has `?sw=1`.

## Sorting

Under the two menus, **Sort** orders the sidebar's exams by one of these:

- Suggested: the collection's own order
- Exam date: newest or oldest first, with each term's exams in the order they were given
- Answered
- Progress (share correct)
- Length (counted questions)
- Staff picks: only where a collection has picks

The arrow chip reverses the order. Ties go to the newest exam. The choice is saved per collection in `_cs[<collection>].sort` and doesn't change the URL. The logic is `sortExams` in `src/js/model.js`.

## Saved data

Saved data uses `localStorage['cs61a-practice-v2']` (see `src/js/store.js`). Schema 3 adds the selected collection, per-collection navigation, unchecked drafts, and collection plus content version on timed attempts.

Migration from schema 2 is repeatable and keeps the old fields, so a rollback still works. It also stores one backup copy in `cs61a-practice-v2:before-sv3`. People with schema-2 data start on Midterm 3, and new visitors start on `defaultCollection` in `content/collections/index.json`.

## Analytics

`worker.js` documents the event layout. Every event now carries the study collection in `blob8`, alongside the original source exam id in `blob4`. Events from before collections existed have an empty `blob8`, and they were all Midterm 3 practice. Collection switches are logged as `study_select`. The playground logs `pg_open`, `pg_run` (the language, and whether it ran tests), `pg_share`, `pg_import` (the problem and what filled the blanks) and `pg_from_practice`; live Gleam runs as you type aren't logged.

## Feedback

**Send feedback** at the bottom of the sidebar opens a dialog. The message goes to `POST /f`, and `worker.js` emails it,
along with the page path, study collection and country. Visitors give no name or email, and Ben's address is never in the
page or this repo: it's the `FEEDBACK_TO` Wrangler secret. The mail comes from `feedback@benrosar.io` (`FEEDBACK_FROM`).
A hidden honeypot field and a rate limit of 5 messages a minute per IP keep bots out.

One-time setup, in the Cloudflare dashboard and then from the `website/` folder:

1. Turn on **Email Routing** for benrosar.io and add your address under **Destination addresses**, then click the link
   Cloudflare emails you. The send binding only delivers to verified addresses.
2. `npx wrangler secret put FEEDBACK_TO --config practice/wrangler.jsonc`, then paste that address.
3. For `wrangler dev`, put `FEEDBACK_TO=you@example.com` in `practice/.dev.vars`, which is git-ignored. Locally, mail isn't
   sent: wrangler logs it instead.

## Study and grading tools

- **Topic** filters the selected collection to questions with that topic, preserving the shared problem statement. **Topic progress** reports current correct/total and correct/answered accuracy; unattempted questions are excluded from accuracy.
- **Review missed** includes questions missed in normal practice and source-based timed exams, even after a later correct practice answer. Resetting a question clears its review marker. Modified timed questions remain in their attempt review because they are different questions from the source bank.
- **Hint / Next hint** reveal two progressively more specific hints. Authored hints are used when available, with topic-level guidance otherwise. Answer reveals and timed reviews include available question explanations and separate, clearly labeled topic walkthroughs (`src/js/learning.js`). Topic examples are not presented as exact solutions or staff explanations.
- **Check whole solution** runs all entered code blanks together, including code choices, without substituting official answers. It appears only when every template blank is mapped to a question and all needed questions are visible. This result is separate from individual-question progress. Individual checks still use official answers in the other blanks.
- Grading preserves Python/Gleam capitalization, token boundaries, indentation in executable Python, and spaces inside strings. Alternate executable forms run through the runtime. Encoded restrictions are checked before matching accepted answers; tests alone do not prove an algorithm correct for all inputs or enforce unencoded prose requirements.
- Runtime requests are serialized in restartable workers (`src/js/runner.js`). Loading has a 60-second deadline and execution an 8-second deadline. Startup errors preserve drafts and existing progress. Timed results remain provisional for unavailable checks; **Retry unavailable checks** updates the same attempt, including when opened from history.
- `content/enrich.mjs` adds answer notes, hint metadata, whole-solution links and restrictions while preserving permanent source ids. `content/sql.mjs` attaches SQLite templates and three site-authored datasets to each executable SQL problem. SQL is evaluated using Pyodide 0.26.4's `sqlite3` package and `content/sql-prelude.py`. Each reference and submitted query gets its own fresh in-memory database; unordered outputs retain duplicate-row counts, and ordered tasks compare order too. Query settings, attached files and fixture mutations are prohibited.
- SQL errata corrected for execution: Summer 2024 Final Q8(c) duplicated `WHERE`; Summer 2025 Final Q6 used `admitted` instead of `admits`; Summer 2023 Final Q9 requires quoting numeric-leading aliases; its A+ SQL query must filter `result < 1000` before aggregation rather than using an aggregate alias in `WHERE`. Corrections appear in the displayed key/template; relevant question notes explain them.
- `61a-fa26-extra-practice.mjs` contains six original site-authored problems (16 questions), covering two Python interpreters, custom types, Results, immutable list processing and a Gleam expression interpreter. These are labeled in practice, timed exams and AI prompts and are not staff material or predictions of final scope.

`tests/grading.test.mjs` covers normalization, restrictions, worker recovery, topic review and SQLite alternatives/boundaries. The Python answer checker also executes complete solutions assembled from the displayed answer choices. Browser tests cover hints, topic practice, missed review, combined Gleam answers, SQLite execution, startup recovery and provisional timed grading.

Progress export/import remains deferred.

## Save-failure reporting

A persistent notice distinguishes browser-reported quota limits, denied storage access, unavailable storage, and unrecognized errors. It keeps unsaved work in memory, offers **Retry saving**, and confirms a successful retry. The notice stays visible across question changes and timed exams, without re-announcing the same failure for every keystroke.

Storage availability is resolved inside error handling, including browsers whose `localStorage` getter itself throws. If the initial read failed and an older save later becomes accessible, saving is paused to avoid overwriting that older progress; the notice asks the student to copy new answers and reload. No saved progress is automatically deleted to make space.

Saving uses local browser storage and needs no internet connection. On a first visit, before the site is cached for offline use, network errors can affect question loading or the Python and Gleam downloads; they are reported separately by those features. Browser tests simulate quota/permission errors, retry recovery, mobile layout, and successful saving while network access is disabled.
