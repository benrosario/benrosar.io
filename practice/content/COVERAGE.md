# Coverage map: CS 61A Fall 2026 study options

This file records where each study option's questions come from, what they cover, and what is missing.
It separates what the course staff said from this site's own classification.

## Course offering

The site targets **CS 61A Fall 2026** (Profs. DeNero and Ousterhout). Two facts establish this:

- `cs61a.org` redirects to `cs61a.org/fa26/`.
- Fall 2026 is the only offering with three midterms. The site's existing Midterm 3 curation also matches it.

Exam facts, from <https://cs61a.org/fa26/> and <https://cs61a.org/fa26/syllabus/> (read 2026-10-28):

| Exam | When / format | Coverage stated by the course |
|---|---|---|
| Midterm 1 | Mon 9/14, 8–9pm, paper, 20 pts | Lectures 1–6 and textbook 1.1–1.6, not the Newton's Method example |
| Midterm 2 | CBTF, week of 10/5, one-hour slot, 20 pts; retakes 10/19–10/20 and 11/5–11/6 | Through Lecture 14: Linked Lists |
| Midterm 3 | Tue 10/27, 8–10pm, paper, 45 pts | Through Lecture 24: Efficiency |
| Final | Fri 12/18, 11:30am–2:30pm, paper, 75 pts | **Not stated.** This site assumes the whole course. |

## Sources

| Source | Used for | Notes |
|---|---|---|
| Fall 2026 study guides for [MT1](https://cs61a.org/resources/guides/fa26/61a-mt1-study-guide.pdf), [MT2](https://cs61a.org/resources/guides/fa26/61a-mt2-study-guide.pdf) and [MT3](https://cs61a.org/resources/guides/fa26/61a-mt3-study-guide.pdf) | Topic boundaries | The MT2 guide covers recursion, tree recursion, lists, dictionaries, comprehensions, `@dataclass`, type hints and `Link`. It has no list mutation, trees or iterators. The MT3 guide adds trees, list and dictionary mutation, objects, iterators and generators. There is no final study guide yet. |
| Past exams and solutions on the [resources page](https://cs61a.org/fa26/resources/), loaded from `https://cs61a.org/resources/_exams/exam_files.json` | Imported questions | The PDF links are recorded per exam in `src.exam` / `src.sol`. |
| Staff "Exam Questions by Topic" index, `https://cs61a.org/resources/_exams/exam_problems_{mt1,mt2,final}.json` | Per-problem topic tags, stored in each problem's `topics` | These are staff tags. Using them to decide scope is this site's classification. |
| Staff in-scope topic list, `https://cs61a.org/resources/_exams/in_scope.json` | The Final's topic list | It lists 23 topics. It does not include Scheme, macros, tail recursion, programs-as-data or nonlocal. |
| The site's existing Midterm 3 data | Midterm 3 notes, skips, CSM picks, and the 13 modified timed problems | Checked against Ed on 10/29/2026 (see Midterm 3 below). Skips match the staff index (#1237). DeNero picks were removed: they were his Midterm 2 picks (#863) copied over. |

**Inaccessible sources:**

- The Ed posts linked from the course home page.
- The PrairieLearn practice midterm and practice quizzes, which require a login.
- The Midterm 3 recommendation post itself.

**Staff recommendations:** none were found publicly for Midterm 1, Midterm 2 or the final. Those options show no picks, and their "Recommended" filter says so.

## How scope is decided

- **Midterm 3** (staff basis): exactly the existing curation. The test suite pins every exam's counted-question total, so changes would be caught.
- **Midterm 1, Midterm 2 and Final** (topic basis): this site's classification, not a staff recommendation.
  - A question counts when every staff topic tag on its part of the problem is on that option's list. The `WWPD` tag describes format, not topic, so it's ignored.
  - Midterm 1 allows: variables and functions, control, higher-order functions, environment diagrams and lambdas.
  - Midterm 2 adds: recursion, tree recursion, sequences, lists, data abstraction and linked lists.
  - The Final allows the staff in-scope list.
  - Problems with nothing in scope are hidden. Shared text and code stay intact for partly included problems, and their excluded parts are labeled "Out of scope" with a reason.
- **Explicit overrides** (`drop` / `keep` with a stated reason in `content/collections/*.json`) cover what the staff tags miss:
  - **Midterm 2:** parts that mutate lists, linked lists or dictionaries, or use generators. Fall 2026 teaches these after Midterm 2, and the MT2 study guide has none of them. For example: Spring 2024 MT2 Q2 and Q4(c), Fall 2023 MT2 Q2, Spring 2026 MT2 Q4, Summer 2025 Final Q5(b–d), Summer 2023 Final Q2(b), Fall 2025 MT2 Q6(c, e), and Summer 2025 Midterm Q3(a)(v) and Q3(b)(ii).
  - **Midterm 1:** list-based parts of Summer 2025 Midterm Q3(a).
  - **Midterm 2:** Summer 2023 Midterm Q6(c) builds a tree; its staff tags list only recursion topics, but trees come after Midterm 2.
  - **Midterm 1 and 2:** the first sub-question of the Summer 2023 Final WWPD session, which uses classes and trees defined for later parts.
  - **Final:** Fall 2025 Final Q5 (async coroutines) has no staff tags. It is **kept**, with a note on the problem. It was on the Fall 2025 final from the same instructors, but the Fall 2026 pages don't confirm coroutines are on this final.
- Where the staff index is wrong, this site classifies the problem itself (`by: 'site'`). The fa25-mt1 index lists another exam's problems for Q2–Q4.

## Per option

| Option | Source exams | Counted questions | Timed practice |
|---|---|---|---|
| Midterm 1 | **New:** Fall 2026 MT1 (this semester's), Fall 2025 MT1, Spring 2025 MT1, Fall 2024 MT1. **Reused by topic:** Summer 2025 Midterm Q2, Summer 2023 Midterm Q3(b–c), Summer 2024 Final Q2, Fall 2024 MT2 Q4(a), Spring 2026 MT2 Q2(b–c) | 100 | 50 min, 4 original problems, one from each of: environment diagrams, WWPD, control, higher-order functions (23 in the pool) |
| Midterm 2 | **New:** Summer 2025 Midterm Q2–4, Summer 2023 Midterm Q3–5. **Reused by topic:** recursion, tree recursion, list and linked-list problems from the ten existing exams | 140 | 50 min, 3 original problems, balanced across linked lists, tree recursion, lists, recursion and basics (23 in the pool). Labeled with the one-hour CBTF slot. |
| Midterm 3 | Unchanged: the ten curated exams | 418 | Unchanged: 50 min / 4 or 1 h 50 min / 8 problems from the 13 modified problems |
| Final | All 18 source exams, the 4 Scheme problems this site adapted to Gleam, and 6 original site-authored problems (all labeled). **New finals:** Fall 2025 Final (all but its Scheme Q6), Spring 2025 Final (all but its Scheme Q7) | 674 | 50 min / 3, 1 h 50 min / 6 or 3 h / 9 problems, round-robin across early material, recursion and lists, MT3 topics, SQL and Gleam. The Gleam problems are the labeled adaptations. The 50-minute exam takes one problem from each of 3 different topic groups. At most one problem per source exam when possible. A+ problems are never drawn. |

Every imported answer was checked against the solution PDFs:

- **Multiple-choice keys** were read from the filled bubbles by measuring the rendered pages. Code shown as images in the PDFs was transcribed from rendered pages.
- **Python fill-in blanks** run with each problem's doctests (`npm run practice:test`, 425 runs).
- **What-would-Python-display and environment-diagram answers** were confirmed by executing the code.
- **SQL answers** were executed in SQLite against each problem's example rows. Spring 2025 Q8(b)'s select-all key is exactly the set of options that reproduce the published result.

## Gleam (replaced Scheme in Fall 2026)

Gleam starts in Week 10, after Midterm 3, so it's on the final only. The course calendar lists:

- Lecture 27 (Functional Programming)
- Discussions 8 and 9
- Lab 8 (Gleam Types)
- Homeworks 7 and 8
- Quizzes 6 and 7

Homework 7 pins Gleam v1.18.1 compiled to JavaScript and tests answers with plain Gleam `assert` functions. Scheme isn't mentioned anywhere on the Fall 2026 site.

**No past Gleam exam questions exist yet.** The Final has:

- **Scheme problems adapted to Gleam:** written by this site, not course staff, and labeled as such everywhere they appear. Each keeps its original's structure, blanks and examples where Gleam allows. Answers follow the official Scheme solutions, and code answers are checked by compiling and running them.
  - Summer 2024 Final Q6 (Treequality): tree custom type, zip, treequals
  - Summer 2023 Final Q8 (List Methods): pad, shorten
  - Summer 2024 Final Q7 (dictionary abstraction): as an immutable list of pairs, with `get_item` returning a `Result`
  - Summer 2025 Final Q7 (rotate)
  - **Left out:** questions that depend on Scheme specifics (macros, `scheme_eval`), and the tail-recursion question for `all`, where Gleam's answer is unclear.
- **Scheme questions stay out of scope** for the Final, with the reason "Scheme isn’t taught this semester (Gleam replaced it)". They remain in the shared bank, so Midterm 3's existing curation is unchanged.
- **Topic tags:** Gleam, functional programming, algebraic data types, immutable data and pattern matching. These are this site's own tags, because the staff topic list has none yet. Replace them if staff publish theirs.
- **Interpreters:** unknown whether Lecture 30 uses Gleam or Python. The interpreters classification is unchanged until its materials are posted.

**Waiting on course staff:**

- Discussion 8 and 9 solutions, which aren't posted yet.
- Lab 8 and Homeworks 7–8. These are imported only after they're due and official solutions are released, because Homework 7 requires checkoff interviews.
- Quizzes 6 and 7, which are on PrairieLearn behind a login.
- The final study guide and any final recommendations.

## Errata and corrections

- **Summer 2023 Midterm Q3(b)(iii):** the official answer `pow(10, i) * n % 10` evaluates as `(pow(10, i) * n) % 10` and fails the doctests. The site shows `pow(10, i) * (n % 10)`, explains the problem on the question, and accepts both.
- **Summer 2023 Midterm Q3(c):** the official answer repeats the template's `return`. Both forms are accepted.
- **Spring 2025 MT1 Q3(a):** the docstring line `>> odd = ...` is corrected to `>>>` so the doctest runs.
- **Spring 2023 MT2 Q5 (existing data):** one staff-accepted paper form doesn't parse as Python. It's accepted by text match only.
- **Restrictions:** every rule an exam states about what an answer may contain is enforced on code-checked blanks (`RULES` in `enrich.mjs`), and the build checks that official answers obey them. Spring 2025 Final Q9(b)'s "only yields as many values as necessary" is checked by counting the values f yields (the playground import shows that counting version). Not enforceable by the site: Spring 2023 MT2 Q4's "the input t must not be modified" (only its doctests check it). Restrictions on text-matched blanks need no rule, since only the official answers match.
- **Summer 2025 Midterm Q5(b):** the doctest output `True     # 4` isn't valid doctest output; checking uses plain `True`.
- **Pictures reproduced as text:** Summer 2023 Midterm Q2's environment diagram and Q6's example trees (in `tree(...)` notation), and Spring 2025 Final Q2's code.
- **Tree data abstraction:** problems written against the course's `tree`/`label`/`branches` functions are checked with them supplied (`content/trees.mjs`), never shown. Its `print(t)` matches `print_tree`, since Summer 2025 Midterm Q5(a) prints a tree directly.
- **Fall 2024 MT1 Q5 and Summer 2023 Midterm:** blank letters repeat across parts, so they are relettered across each problem. Labels give the exam's own letter.

## Gaps (not covered yet)

- **Material taught after Midterm 3 has almost no past-exam questions.** Gleam has only this site's adaptations so far; see the Gleam section.
  - No past exam material exists for: functional programming, algebraic data types, immutable data, coding agents, browsers, applications, software testing, software tracing, ethics.
  - **Interpreters:** past interpreter questions use Scheme. The Final now has three original interpreter exercises: expression-tree evaluation in Python, name lookup/local bindings in Python, and a Gleam expression interpreter. They are site-authored practice, not past exams or a claim about the unpublished course scope.
  - **SQL:** five past SQL problems are in the Final. A sixth problem in the timed pool is the Summer 2023 Final WWPD, which has an SQL part.
  - The final's scope and any staff review recommendations aren't published yet. Revisit when the final study guide appears.
- **Midterm 2 had no staff practice exam reachable**, because the PrairieLearn practice midterm needs a login. The real exam was computer-based. This site's version is paper-style past-exam problems.
- **Added 10/30/2026 (PDFs supplied by the site owner; official copies are on cs61a.org):** Summer 2024 Midterm (all but Q8, a drawing), Summer 2026 Midterm (all but Q2.7, a one-sentence free response, and Q8, Just for fun), Summer 2026 Final (all but Scheme Q7 and Q8, the free-response half of Q3.10, and Q10, Just for fun). They count toward Midterm 2 by topic, Midterm 3 (the two midterms, as #1237 recommends; Summer 2024 7(e) skipped) and the Final; none of their problems is within Midterm 1's topics.
  - Pictures written as text: the Summer 2026 environment diagrams, Q6's bracket and Diagrams 1-4 (as `tree(...)`), the final's airports-and-stations diagram, and the Summer 2024 memoized call diagram (described).
  - Checking supplies what the exams assume but don't show: Summer 2026 Midterm Q6's tests (written by this site from Diagrams 1-4, and labeled), the final's Q3.5/Q3.6-3.9 doctest setup, and Q5's `setup` function (rebuilt from the diagram).
  - Errata: Summer 2026 Final Q3.6's official key uses `showtime.remaining_capacity`, an attribute Showtime doesn't have; checking uses `showtime.capacity` and accepts both. Summer 2026 Midterm Q6.10's key repeats the template's `return`; both forms are accepted. Doctest outputs the exams wrote informally (`Function`, `StopIteration`, a bare `>>>`) are made valid in the checking copy only.
  - Restrictions: Summer 2024 Q4's "no [ or ]" is enforced as no indexing or slicing, since its own official answers build lists. Summer 2026 Final Q6.4's "linear time" can't be checked.
  - Summer 2026 Final Q5.2-5.4 also accept a swapped version (`!=` with (c) and (d) exchanged); only Check whole solution can confirm it, since single blanks are checked with the official answers in the others.
- **Not imported:** Fall 2025 Final Q6 and Spring 2025 Final Q7 are Scheme. Summer 2025 Midterm Q6 and Summer 2024 Midterm Q8 are 0-point “Just for Fun” questions. (Spring 2025 Final Q1, 2, 4, 5, 6 and 9, Summer 2025 Midterm Q1 and Q5, and Summer 2023 Midterm Q1, 2 and 6 were imported on 10/29/2026; they count toward the Final, and toward Midterm 1 or 2 only where their topics allow.) Older Midterm 1 and 2 exams from 2014–2024 are also available on the resources page.
- **No modified timed-practice problems exist for Midterm 1, Midterm 2 or the Final.** Their timed exams use original past-exam problems and say so. Writing modified versions would be new content and needs separate review.
- **Midterm 3 curation questions, kept unchanged and flagged for review:**
  - The Summer 2023 and 2024 finals are listed as "full exam" Midterm 3 practice, but they include Scheme and SQL problems that aren't Midterm 3 topics.
  - Summer 2025 Final Q3(g) is marked out of scope: it uses orders of growth, which the staff index (#1237) says is out of scope for Midterm 3.
- **Midterm 3, checked against Ed (10/29/2026):**
  - Staff named no Midterm 3 question picks. The Midterm 3 index (#1237, TA Esha Telang) says to practice with whole past Midterm 2 exams and lists parts to skip (mutating linked lists or trees, repr, orders of growth). Every skip on the site's Midterm 2 exams and Spring 2026 matches it.
  - The DeNero picks this site showed for Midterm 3 were his Midterm 2 picks (#863) and have been removed from Midterm 3; they remain on Midterm 2 and, through it, on the Final.
  - The CSM picks have no source on Ed (the CSM review post, #1307, lists topics only); they're kept and labeled "source not confirmed".
  - #1237 recommends the Summer 2023, 2024, 2025 and 2026 midterms; this site lists the Summer 2023, 2024 and 2025 finals (labeled as the site's choice) and, since 10/30/2026, the Summer 2024 and 2026 midterms. All four summer midterms are now Midterm 3 practice. #1237's Summer 2024 skip, 7(e), was applied to the Summer 2024 Final's 7(e), a Scheme blank; it's removed.

## Practice expansion

The Final includes six original site-authored problems (16 questions) in `61a-fa26-extra-practice.mjs`, with executable tests, worked explanations and two hints per question. The expanded source bank has 668 questions; 113 carry question-specific notes/explanations. All 32 adapted Gleam questions and all new questions have site-authored explanations. Topic walkthroughs provide additional worked examples and are labeled separately from exact solutions.

Five source SQL problems now execute in SQLite on three varied datasets apiece, including the zero-point A+ SQL problem. SQL multiple-choice questions still use their accepted choice keys. Errata in SQL templates/keys were corrected for execution (see README); existing question ids remain stable.

Topic filtering, per-topic progress and review of missed questions are available across study collections. Whole-solution checking is available for completely mapped code/SQL templates; it verifies submitted blanks together rather than mixing each one with the key. The incomplete imports and course-material availability gaps above remain separate from these additions.
