# CS 61A practice site (practice.benrosar.io)

This is a static site of past CS 61A exam questions with Python checking, timed practice exams and study collections.
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
    selector.js          "Studying for" and the ?exam= URL
    sort.js              the Sort chips that order the sidebar's exams
    grading.js           answer checking (Pyodide for Python doctests, the Gleam worker for Gleam tests)
    gleam-worker.js, gleam-core.js  compiles and runs Gleam answers (official compiler, WebAssembly)
    chrome.js, highlight.js, ai.js, events.js, util.js, state.js
  src/static/            copied as is (apple-touch-icon.jpg)
  content/exams/         source exams, each stored once (.json, or .mjs written with content/author.mjs)
  content/collections/   the four study options: scope rules, notes, picks, timed settings (index.json sets the order)
  content/timed/         modified problems for Midterm 3 timed practice
  content/python-prelude.py  Link, Tree and the doctest runner used to check Python answers
  content/COVERAGE.md    where each option's questions come from, what they cover, and the known gaps
  scripts/               build, validate, preview sync, staff topic import, Gleam toolchain (gleam-toolchain.mjs)
  tests/                 Node tests, the Python answer check, and browser tests (tests/ui)
  worker.js, wrangler.jsonc  deployment and the /e analytics endpoint
```

## Commands (run from the `website/` folder)

| Command | What it does |
|---|---|
| `npm run practice:build` | Validates the content and builds `practice/public/`. It fails on any content error. |
| `npm run practice:serve` | Serves `practice/public/` at <http://localhost:8614>. |
| `npm run practice:test` | Runs the content, collection, migration, build/preview and Worker tests, then runs every Python answer against its doctests (needs `python3`). |
| `npm run practice:test:ui` | Runs the browser tests in headless Chrome: switching, deep links, Back/Forward, unfinished answers, migration, timed attempts, grading, keyboard, mobile and themes. Set `CHROME_PATH` if Chrome isn't in /Applications. Set `PRACTICE_SKIP_PYODIDE=1` to skip the one test that downloads Pyodide. |
| `npm run practice:sync` | Builds, then refreshes the local preview copy in `../exam-practice`. It deletes only files an earlier sync wrote. |
| `npm run practice:check-preview` | Exits 1 if the preview copy doesn't match a fresh build. |
| `npm run deploy:practice` | Builds, runs `practice:test`, then deploys with wrangler. It deploys only after a clean build and passing tests. |

`node practice/scripts/build.mjs --allow-invalid` builds despite content errors. Use it only for work in progress.

## Content

- **Question ids.** A saved answer's key is `<exam id>|<question id>`. Problems have ids `<exam id>/<number>`. Never renumber them: progress is stored by these ids.
- **Collections.** Each collection lists the source exams it uses, with `note`, staff `skip` text, `oos` (staff out of scope), `picks` (`dn` / `csm`), `tips`, and `drop` / `keep` overrides with reasons. Scope comes from `scope.basis`: `staff` (explicit, Midterm 3) or `topics` (the staff topic tags must all be on `scope.topics`). A question shared by several collections counts toward each one where it's in scope.
- **Adding an exam.** Write `content/exams/<id>.mjs` with the helpers in `content/author.mjs`. Pass `run: true` so Python blanks are checked by doctests, and add the exam to the right collections. Then run `npm run practice:test`. The staff topic tags come from `scripts/annotate-topics.mjs` (JSON exams) or are written in the `.mjs`.
- **Checking.** Python blanks are compared with the accepted answers first, then run against the problem's doctests. Scheme, SQL and other text blanks are only compared as text (case, spacing and quote style ignored), and the page says so. Multiple choice can list `also` (other choices the staff accepted).

## Gleam

Gleam replaced Scheme in Fall 2026 and is on the final. The course uses Gleam v1.18.1, compiled to JavaScript.

- **Checking answers.** Code answers in Gleam problems are compiled in the browser with the official Gleam compiler's WebAssembly build, the one Gleam's language tour uses. The problem's `*_test` functions then run, in the same `assert` style as the course's homework tests. "Evaluates to" questions compile `assert <expression> == <answer>`. The page shows compile errors and failed asserts, and stops infinite loops after 8 seconds.
- **Toolchain.** `scripts/gleam-toolchain.mjs` pins the compiler (1.18.1), `gleam_stdlib` (1.0.5) and the JavaScript prelude by SHA-256. It downloads them once into `practice/.cache/` (git-ignored), so the first build needs network.
- **What's served.** The build serves everything under `assets/gleam/<version>/`: the compiler, the standard library's source (for type-checking), the standard library precompiled to JavaScript (what a compiled answer imports), and both Apache-2.0 licences. That's about 5 MB uncompressed, loaded only when someone checks a Gleam code answer.
- **Text answers.** Gleam text answers are compared case-sensitively, because `Ok` and `ok` differ.
- **Authoring.** Use `gl()` code blocks and one `glTests()` block (shown on the page as the tests), with `problem(..., {run: 'gleam'})`. Tie a code blank to a question with `blank(..., {r: 'x'})`, or write an "evaluates to" question with `blank(..., {ev: 'expression'})`.
- **Testing.** `npm run practice:test` compiles and runs every official and accepted answer with the same compiler in Node. It also checks that each problem's tests fail when a blank is left as `todo`.
- **Adapted problems.** These are Scheme problems this site rewrote in Gleam. They live in `content/exams/61a-fa26-gleam-adapted.mjs` and carry `adapted: {from, problem}`. The page labels them wherever they appear, including timed practice and copied AI prompts.

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

`worker.js` documents the event layout. Every event now carries the study collection in `blob8`, alongside the original source exam id in `blob4`. Events from before collections existed have an empty `blob8`, and they were all Midterm 3 practice. Collection switches are logged as `study_select`.
