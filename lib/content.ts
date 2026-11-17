export const profile = {
  name: "Ben Rosario",
  github: "https://github.com/benrosario",
  linkedin: "https://www.linkedin.com/in/ben-rosario",
  resume: "/resume.pdf",
  site: "https://benrosar.io",
  email: "hello@benrosar.io",
  availability: "Looking for a Summer 2027 internship in software engineering or applied AI.",
};
export type Project = {
  slug: string;
  title: string;
  summary: string;
  problem: string;
  usage: string;
  learning: string;
  feedback: string;
  nextSteps: string;
  repo: string;
  stack: string[];
  metrics: { value: string; label: string }[];
  evidence: { title: string; description: string; url: string }[];
  decisions: { title: string; description: string }[];
};
// Add a project here to give it a homepage card and its own case study route.
export const projects: Project[] = [
  {
    slug: "sierra-class-helper",
    title: "Sierra Class Helper",
    summary:
      "A Discord course-finding assistant adopted by 40+ Sierra College students, searching approximately 2,000 course records with Python, FastAPI, and hybrid retrieval.",
    problem:
      "Finding classes meant juggling Sierra’s course search, instructor reviews, and a personal schedule. A registration-system update made that process more frustrating, so I built a Discord bot that lets students explore courses and ask follow-up questions in conversation.",
    usage:
      "Students can find course and instructor information through the bot, then check it against their own schedule and enroll on Sierra’s website.",
    learning:
      "Building it also gave me hands-on experience with retrieval-augmented generation: finding relevant course information and using it to inform an AI-generated answer.",
    feedback:
      "One thing I hadn’t anticipated was how much students appreciated asking questions in languages other than English. Making course information easier to access meant more than improving search.",
    nextSteps:
      "The website connects to the API through a Google-authenticated demo with three lifetime attempts per account. A broader retrieval-quality benchmark is next, to measure how often search returns the right courses.",
    repo: "https://github.com/benrosario/sierra-class-helper",
    stack: ["Python", "FastAPI", "OpenAI", "FAISS", "Discord"],
    metrics: [
      { value: "40+", label: "active users" },
      { value: "~2,000", label: "course records searched" },
      { value: "Hourly", label: "course data refresh" },
    ],
    evidence: [
      {
        title: "Google sign-in and persistent demo quotas",
        description: "Security tests use locally signed tokens and the real Google verifier with substituted certificate responses. They cover invalid tokens and verify that persistent quota admission happens before paid work, without real accounts or model calls.",
        url: "https://github.com/benrosario/sierra-class-helper/blob/f62d7a40f602718a5ab380ebe03c057f84d27ceb/tests/test_demo_security.py",
      },
      {
        title: "Linear algebra vs. college algebra",
        description: "A lexical-search fixture requires ‘linear algebra’ to rank Diff Equations/Linear Alg first. A separate fusion fixture checks that a strong keyword match can outrank the vector list’s first candidate.",
        url: "https://github.com/benrosario/sierra-class-helper/blob/098f6a36991704f9d6ffb0fc09e85367302136c6/tests/test_search_hybrid.py#L42-L51",
      },
      {
        title: "Course codes and year numbers",
        description: "Fixtures check that ‘physics 205’ resolves to PHYS 0205 and that ‘2026’ does not accidentally match course number 0202.",
        url: "https://github.com/benrosario/sierra-class-helper/blob/098f6a36991704f9d6ffb0fc09e85367302136c6/tests/test_search_hybrid.py#L22-L66",
      },
      {
        title: "Continuous integration on Python 3.12–3.14",
        description: "GitHub Actions runs the test suite on three Python versions. Live integration tests require an API key and a built index, so they skip in CI.",
        url: "https://github.com/benrosario/sierra-class-helper/blob/098f6a36991704f9d6ffb0fc09e85367302136c6/.github/workflows/ci.yml",
      },
    ],
    decisions: [
      {
        title: "Search that understands both meaning and specifics.",
        description:
          "FAISS vector search is combined with an IDF-weighted lexical channel. Semantic search finds related ideas; lexical search preserves distinctive words such as ‘linear’ in ‘linear algebra’.",
      },
      {
        title: "Fresh data without interrupting a conversation.",
        description:
          "A Playwright scraper refreshes course data hourly. The scheduler builds a new search index and atomically swaps its reference, so in-flight requests continue using a consistent snapshot.",
      },
      {
        title: "One backend, separate client permissions.",
        description:
          "The Discord bot uses authenticated bot-only routes. The web demo uses a separate endpoint that verifies a Google ID token before running the same retrieval and answer-generation pipeline. The website never receives the bot’s credentials.",
      },
      {
        title: "Regression tests for real search failures.",
        description:
          "The repository tests specific failure cases, including course-number matching and distinguishing linear algebra from college algebra. Each fix has an example that would catch the same problem again.",
      },
      {
        title: "Rate limits and usage analytics.",
        description:
          "The demo reserves one of three lifetime attempts per Google account in SQLite before retrieval or generation, with a separate daily cap. Discord usage analytics remain separate. Message size, conversation history, retrieved context, and generated output are bounded.",
      },
      {
        title: "Instructor reviews alongside course information.",
        description:
          "The bot combines course details with Rate My Professors information, reducing the need to move between separate sites. Students still check their personal schedule and enroll through Sierra.",
      },
    ],
  },
];

// The CS 61A exam practice site (practice/ in this repo). It is a homepage tab only: it is not in `projects`, so it has no case-study route.
// Counts come from the built content file (`npm run practice:build`, then practice/public/61a/assets/content.*.json): 23 exam sets,
// of which 21 are past staff exams (the other two are sets written for the site), holding 137 problems and 835 questions.
export const practiceSite = {
  title: "CS 61A Exam Practice",
  tagline: "Past exams, checked in your browser.",
  description:
    "A study site of past CS 61A exam questions with in-browser answer checking, timed practice exams, and a playground that runs Python and Gleam. It works offline after one visit.",
  url: "https://practice.benrosar.io/",
  metrics: [
    { value: "21", label: "past exams, Summer 2023 to Fall 2026" },
    { value: "835", label: "questions with in-browser answer checking" },
    { value: "500+", label: "students have used it" },
  ],
  stack: ["JavaScript", "Pyodide", "Gleam compiler (WebAssembly)", "Service worker", "esbuild", "Cloudflare Workers"],
  features: [
    {
      title: "Past exam questions with answer checking.",
      description: "Multiple choice, select-all and fill-in-the-blank questions are checked as you answer, and coding answers are run against the exam’s doctests.",
    },
    {
      title: "Timed practice exams.",
      description: "A practice exam draws problems for the exam you’re studying for, Midterm 1, 2, 3 or the Final, and counts down the time.",
    },
    {
      title: "Study collections.",
      description: "Each exam has its own collection with topic filters, so you can work through only what it covers.",
    },
    {
      title: "A playground for Python and Gleam.",
      description: "Any problem can be opened in an editor that runs Python or Gleam in the browser, and its doctests or tests can be run there.",
    },
  ],
  siblingNote: "A CS 61B version of the site covers Java exam questions.",
  siblingUrl: "https://61b.benrosar.io/",
  screenshots: {
    light: "/projects/practice-61a-light.webp",
    dark: "/projects/practice-61a-dark.webp",
    alt: "The CS 61A practice playground showing a Fall 2025 Final problem above a Python editor, with all 9 doctests passing.",
    width: 1120,
    height: 760,
  },
};
