import Image from "next/image";
import Link from "next/link";
import { ProjectMetrics } from "@/components/project-overview";
import { ProjectTabs } from "@/components/project-tabs";
import { SierraDemo, SierraDemoStage, TryLiveLink } from "@/components/sierra-demo";
import { ThemePicker } from "@/components/theme-picker";
import { Arrow, Document, GitHub, LinkedIn } from "@/components/icons";
import { practiceSite, projects, profile } from "@/lib/content";

// The replay in the Sierra tab types for about 4.5 s from the moment the page shows it, and
// the tour waits 1.2 s before it starts, so 9 s leaves time to read the finished reply.
const SIERRA_TOUR_MS = 9000;

// The homepage shows the first four tags (one or two rows) so the screenshot can be larger;
// the full stack stays in lib/content.ts.
const HOMEPAGE_PRACTICE_TAGS = 4;

const questionCount = practiceSite.metrics.find((metric) => /question/i.test(metric.label))?.value;

const roles = [
  {
    title: "Student Body President",
    detail:
      "Chaired an 18-member student board that met 16 times a semester. Represented 21,000 students and oversaw the passage of 63 bills. Directed a $342,000 annual operating budget and $800,000 in reserves.",
  },
  {
    title: "Student Trustee",
    detail:
      "The students’ voice on the district’s governing board, with an advisory vote. Reviewed district policy and contracts for science building and student housing projects worth $84M and $98M.",
  },
  {
    title: "Tutor",
    detail: "Two years tutoring math, computer science, English, and history, averaging 15 students a week.",
  },
];

function NewTab() {
  return <span className="sr-only"> (opens in a new tab)</span>;
}

function SierraPanel() {
  const project = projects[0];
  return (
    <SierraDemo>
      <div className="panel-grid sierra-grid">
        <div className="panel-story">
          <h2>{project.title}</h2>
          <p className="project-subtitle">Finding classes, through conversation.</p>
          <p className="project-description">
            A Discord bot that brings Sierra College course search and instructor reviews into a
            single conversation. Built after a registration-system update made finding classes
            harder, it now has 40+ active users.
          </p>
          <ProjectMetrics project={project} />
          <div className="tags">
            {project.stack.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <TryLiveLink />
          <div className="project-links">
            <Link className="text-link boxed-link" href={`/projects/${project.slug}`}>
              Read the case study <Arrow />
            </Link>
            <a className="text-link boxed-link" href={project.repo} target="_blank" rel="noreferrer">
              <GitHub /> Source on GitHub
              <NewTab />
            </a>
          </div>
          <p className="project-note">
            <span className="status-dot" aria-hidden="true" /> Deployed on Discord <span aria-hidden="true">&middot;</span> 2026
          </p>
        </div>
        <SierraDemoStage />
      </div>
    </SierraDemo>
  );
}

function PracticePanel() {
  const { screenshots } = practiceSite;
  const host = new URL(practiceSite.url).host;
  const image = { width: screenshots.width, height: screenshots.height, unoptimized: true };
  return (
    <div className="panel-grid practice-grid">
      <div className="panel-story">
        <h2>{practiceSite.title}</h2>
        <p className="project-subtitle">{practiceSite.tagline}</p>
        <p className="project-description">{practiceSite.description}</p>
        <ProjectMetrics project={practiceSite} />
        <div className="tags">
          {practiceSite.stack.slice(0, HOMEPAGE_PRACTICE_TAGS).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="project-links">
          <a className="text-link boxed-link" href={practiceSite.url} target="_blank" rel="noopener noreferrer">
            Open the practice site <Arrow />
            <NewTab />
          </a>
        </div>
      </div>
      <div className="shot-col">
        <a className="shot" href={practiceSite.url} target="_blank" rel="noopener noreferrer">
          <span className="shot-bar" aria-hidden="true">
            <span className="shot-dots" />
            <span className="shot-url">{host}</span>
          </span>
          {/* Only the image for the current theme is displayed; the other is display:none,
              so it is neither loaded (lazy) nor exposed to assistive technology. */}
          <span className="shot-view">
            <Image {...image} className="shot-light" src={screenshots.light} alt={screenshots.alt} />
            <Image {...image} className="shot-dark" src={screenshots.dark} alt={screenshots.alt} />
          </span>
          <NewTab />
        </a>
        <p className="sibling-note">
          {practiceSite.siblingNote}{" "}
          <a className="inline-link" href={practiceSite.siblingUrl} target="_blank" rel="noopener noreferrer">
            {new URL(practiceSite.siblingUrl).host}
            <NewTab />
          </a>
        </p>
      </div>
    </div>
  );
}

function AboutPanel() {
  return (
    <div className="panel-grid about-grid">
      <div className="about-copy">
        <h2 className="sr-only">About me</h2>
        <p className="about-lead">
          I’m studying Cognitive Science at Berkeley, where I’ve been especially interested in neural
          networks and how people learn.
        </p>
        <p>
          I also enjoy building things for students around me. At Sierra College, I made a bot to help
          find classes. More recently at Berkeley, I built practice sites for CS 61A and CS 61B exams.
        </p>
        <div className="focus-list">
          <p className="focus-title">Currently exploring</p>
          <ul>
            <li>Neural networks</li>
            <li>Retrieval-augmented generation</li>
            <li>Software development</li>
          </ul>
        </div>
      </div>
      <section className="roles" aria-labelledby="roles-title">
        <h3 id="roles-title">At Sierra College</h3>
        <dl>
          {roles.map((role) => (
            <div key={role.title}>
              <dt>{role.title}</dt>
              <dd>{role.detail}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <header className="site-header">
        <div className="site-header-inner wrap-wide">
          <div className="header-left">
            <a className="wordmark" href="#home" aria-label="Ben Rosario home">
              ben rosario
            </a>
            <div className="profile-links">
              <a className="profile-link" href={profile.github} target="_blank" rel="noreferrer">
                <GitHub /> <span className="profile-label">GitHub</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a className="profile-link" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                <LinkedIn /> <span className="profile-label">LinkedIn</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a className="profile-link" href={profile.resume} target="_blank" rel="noopener noreferrer">
                <Document /> <span className="profile-label">Resume <span className="file-type">PDF</span></span>
                <span className="sr-only"> (PDF, opens in a new tab)</span>
              </a>
            </div>
          </div>
          <nav aria-label="Contact and settings">
            <a className="nav-email" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <ThemePicker />
          </nav>
        </div>
      </header>
      <main id="home" className="home wrap-wide">
        <div className="rail-intro">
          <h1>
            Building software that makes work easier<span className="orange">.</span>
          </h1>
          <p className="rail-meta">
            Studying Cognitive Science at UC Berkeley, Class of 2028 <span aria-hidden="true">·</span> San Francisco Bay Area
          </p>
          <p className="rail-meta">
            Before Berkeley, I was Student Body President at Sierra College, where I represented 21,000 students.
          </p>
          <p className="availability">
            <span className="status-dot" aria-hidden="true" />
            {profile.availability}
          </p>
        </div>
        <section className="stage" id="work" aria-label="Projects and background">
          <ProjectTabs
            label="Projects and background"
            tabs={[
              {
                id: "sierra",
                label: projects[0].title,
                summary: "semantic + IDF keyword search",
                tourMs: SIERRA_TOUR_MS,
                panel: <SierraPanel />,
              },
              {
                id: "practice",
                label: "Berkeley CS61a Practice Tool",
                summary: "500+ users/month",
                panel: <PracticePanel />,
              },
              {
                id: "about",
                label: "About me",
                summary: "my background",
                panel: <AboutPanel />,
              },
            ]}
          />
        </section>
        <footer className="rail-end rail-foot">
          <span>© {new Date().getFullYear()} Ben Rosario</span>
          {/* The header shows the email except on phones, where it is hidden for space. */}
          <a className="rail-foot-email" href={`mailto:${profile.email}`}>{profile.email}</a>
        </footer>
      </main>
    </>
  );
}
