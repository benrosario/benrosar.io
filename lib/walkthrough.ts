export const prompts = [
  "What can it do?",
  "How does it work?",
  "Why build this?",
];
// A deterministic project guide, not a simulated live model or course catalog.
export function walkthroughAnswer(message: string): string {
  const text = message.toLowerCase();
  if (/how|stack|built with|architect|technical|search work/.test(text))
    return "Behind the conversation is a Python + FastAPI service. It combines FAISS semantic search with keyword matching, then passes relevant course information to an AI model. A Playwright scraper refreshes the catalog hourly. The Discord bot is one interface; this website is the next.";
  if (/why|inspir|problem|motivat/.test(text))
    return "Ben built Sierra Class Helper after a registration-system update made course search more frustrating. Students were juggling course search, instructor reviews, and their own schedules. The bot lets them explore courses through conversation, and building it was a way to learn more about retrieval-augmented generation. Students also appreciated being able to ask questions in their own language.";
  if (/fresh|update|data|scrap/.test(text))
    return "The backend refreshes course information every hour and professor ratings daily. It builds a fresh search index before swapping it into use, so a refresh doesn’t interrupt an active request. This walkthrough isn’t connected to that live data yet.";
  if (/test|reliab|quality/.test(text))
    return "The repository includes regression tests for real retrieval bugs, such as course-number matching and choosing linear algebra over college algebra. There are also integration tests for the API. You can explore the implementation through the source link.";
  if (/what can|capabil|feature|do\?|hello|^hi$/.test(text))
    return "In Discord, students can ask about courses, meeting times, instructors, campuses, and availability, then continue with follow-up questions. Students still check courses against their personal schedule and enroll on Sierra’s official website. Here, you can explore the project’s design while its web connection is being prepared.";
  if (
    /class|course|math|cs |computer|fall|spring|summer|enroll|professor/.test(
      text,
    )
  )
    return "That’s the kind of question Sierra Class Helper is built for. Live course search isn’t connected to this website yet, so I can’t give you current classes or availability here. Try ‘How does it work?’ to explore the implementation, or use Sierra College’s official class search for current information.";
  return "This is a guided project walkthrough with prepared answers, rather than a live AI chat. Ask what Sierra Class Helper can do, how its search works, why it was built, how data stays fresh, or how it’s tested.";
}
