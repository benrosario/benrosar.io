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
| The site's existing Midterm 3 data | Midterm 3 notes, skips, DeNero and CSM picks, and the 13 modified timed problems | Kept as is. The original staff post they came from isn't publicly reachable, probably because it's on Ed. |

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
  - **Midterm 1 and 2:** the first sub-question of the Summer 2023 Final WWPD session, which uses classes and trees defined for later parts.
  - **Final:** Fall 2025 Final Q5 (async coroutines) has no staff tags. It is **kept**, with a note on the problem. It was on the Fall 2025 final from the same instructors, but the Fall 2026 pages don't confirm coroutines are on this final.
- Where the staff index is wrong, this site classifies the problem itself (`by: 'site'`). The fa25-mt1 index lists another exam's problems for Q2–Q4.

## Per option

| Option | Source exams | Counted questions | Timed practice |
|---|---|---|---|
| Midterm 1 | **New:** Fall 2026 MT1 (this semester's), Fall 2025 MT1, Spring 2025 MT1, Fall 2024 MT1. **Reused by topic:** Summer 2025 Midterm Q2, Summer 2023 Midterm Q3(b–c), Summer 2024 Final Q2, Fall 2024 MT2 Q4(a), Spring 2026 MT2 Q2(b–c) | 100 | 50 min, 4 original problems, one from each of: environment diagrams, WWPD, control, higher-order functions (23 in the pool) |
| Midterm 2 | **New:** Summer 2025 Midterm Q2–4, Summer 2023 Midterm Q3–5. **Reused by topic:** recursion, tree recursion, list and linked-list problems from the ten existing exams | 140 | 50 min, 3 original problems, balanced across linked lists, tree recursion, lists, recursion and basics (23 in the pool). Labeled with the one-hour CBTF slot. |
| Midterm 3 | Unchanged: the ten curated exams | 418 | Unchanged: 50 min / 4 or 1 h 50 min / 8 problems from the 13 modified problems |
| Final | All 18 exams. **New finals:** Fall 2025 Final (all but its Scheme Q6), Spring 2025 Final Q3 and Q8 (SQL) | 552 | 50 min / 3, 1 h 50 min / 6 or 3 h / 9 original problems, round-robin across early material, recursion and lists, MT3 topics and SQL. The 50-minute exam takes one problem from each of 3 different topic groups. At most one problem per source exam when possible. A+ problems are never drawn. |

Every imported answer was checked against the solution PDFs:

- **Multiple-choice keys** were read from the filled bubbles by measuring the rendered pages. Code shown as images in the PDFs was transcribed from rendered pages.
- **Python fill-in blanks** run with each problem's doctests (`npm run practice:test`, 425 runs).
- **What-would-Python-display and environment-diagram answers** were confirmed by executing the code.
- **SQL answers** were executed in SQLite against each problem's example rows. Spring 2025 Q8(b)'s select-all key is exactly the set of options that reproduce the published result.

## Errata and corrections

- **Summer 2023 Midterm Q3(b)(iii):** the official answer `pow(10, i) * n % 10` evaluates as `(pow(10, i) * n) % 10` and fails the doctests. The site shows `pow(10, i) * (n % 10)`, explains the problem on the question, and accepts both.
- **Summer 2023 Midterm Q3(c):** the official answer repeats the template's `return`. Both forms are accepted.
- **Spring 2025 MT1 Q3(a):** the docstring line `>> odd = ...` is corrected to `>>>` so the doctest runs.
- **Spring 2023 MT2 Q5 (existing data):** one staff-accepted paper form doesn't parse as Python. It's accepted by text match only.
- **Fall 2024 MT1 Q5 and Summer 2023 Midterm:** blank letters repeat across parts, so they are relettered across each problem. Labels give the exam's own letter.

## Gaps (not covered yet)

- **Material taught after Midterm 3 has almost no past-exam questions.**
  - No past exam material exists for: functional programming, algebraic data types, immutable data, coding agents, browsers, applications, software testing, software tracing, ethics.
  - **Interpreters:** every past interpreter question uses Scheme, so the Final has no interpreter questions.
  - **SQL:** five past SQL problems are in the Final. A sixth problem in the timed pool is the Summer 2023 Final WWPD, which has an SQL part.
  - The final's scope and any staff review recommendations aren't published yet. Revisit when the final study guide appears.
- **Midterm 2 had no staff practice exam reachable**, because the PrairieLearn practice midterm needs a login. The real exam was computer-based. This site's version is paper-style past-exam problems.
- **Not imported yet:** Spring 2025 Final Q1, 2, 4, 5, 6 and 9. Summer 2025 Midterm Q1 and Q5. Summer 2023 Midterm Q1, 2 and 6. Fall 2025 Final Q6 is Scheme. Older Midterm 1 and 2 exams from 2014–2024 are also available on the resources page.
- **No modified timed-practice problems exist for Midterm 1, Midterm 2 or the Final.** Their timed exams use original past-exam problems and say so. Writing modified versions would be new content and needs separate review.
- **Midterm 3 curation questions, kept unchanged and flagged for review:**
  - The Summer 2023 and 2024 finals are listed as "full exam" Midterm 3 practice, but they include Scheme and SQL problems that aren't Midterm 3 topics.
  - Summer 2025 Final Q3(g) is marked out of scope for "orders of growth" while efficiency is on Midterm 3.
