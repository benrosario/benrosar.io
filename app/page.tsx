import Link from "next/link";
import { ProjectMetrics, ProjectOverview } from "@/components/project-overview";
import { LiveDemo, LiveDemoLink } from "@/components/chat-demo";
import { ThemePicker } from "@/components/theme-picker";
import { Arrow, Document, GitHub, LinkedIn, Spark } from "@/components/icons";
import { projects, profile } from "@/lib/content";

export default function Home() {
  const featured = projects[0];
  return (
    <>
      <header className="site-header">
        <div className="site-header-inner wrap">
          <div className="header-left">
            <a className="wordmark" href="#home" aria-label="Ben Rosario home">
              ben rosario<span className="wordmark-mark" aria-hidden="true"><Spark weight={2.4} /></span>
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
          <nav aria-label="Main navigation">
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a className="nav-email" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <ThemePicker />
          </nav>
        </div>
      </header>
      <main id="home">
        <section className="hero wrap" aria-labelledby="intro-title">
          <div className="hero-copy">
            <h1 id="intro-title">
              I’m a developer studying Cognitive Science at UC Berkeley
              <span className="orange">.</span>
            </h1>
            <p>
              Class of 2028, based in the San Francisco Bay Area. I built{" "}
              <a className="inline-link" href="#work">Sierra Class Helper</a>, a
              course-finding bot adopted by 40+ students at Sierra College.
            </p>
            <p className="availability">
              <span className="status-dot" aria-hidden="true" />
              {profile.availability}
            </p>
            <a className="button primary" href="#work">
              Explore my work <Arrow direction="down" />
            </a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-grid" />
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="sculpture">
              <span className="sculpture-core" />
              <span className="sculpture-ring ring-one" />
              <span className="sculpture-ring ring-two" />
              <span className="sculpture-ring ring-three" />
            </div>
            <span className="art-spark spark-one"><Spark weight={1.2} /></span>
          </div>
        </section>
        <section
          className="work-section wrap"
          id="work"
          aria-labelledby="work-title"
        >
          <h2 className="section-title" id="work-title">What I’m building.</h2>
          <article className="featured-project">
            <div className="project-story">
              <h3>{featured.title}</h3>
              <p className="project-subtitle">
                Finding classes,
                <br />
                through conversation.
              </p>
              <p className="project-description">
                Adopted by 40+ students at Sierra College, Sierra Class Helper
                brings course search and instructor reviews into Discord. I built
                it after a registration-system update made finding classes more
                frustrating.
              </p>
              <ProjectMetrics project={featured} />
              <div className="tags">
                {featured.stack.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <LiveDemoLink />
              <div className="project-links">
                <Link className="text-link" href={`/projects/${featured.slug}`}>
                  Read the case study <Arrow />
                </Link>
                <a className="text-link" href={featured.repo} target="_blank" rel="noreferrer">
                  <GitHub /> Source on GitHub
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
              <p className="project-note">
                <span className="status-dot" aria-hidden="true" /> Deployed on Discord <span aria-hidden="true">&middot;</span> 2026
              </p>
            </div>
            <ProjectOverview />
          </article>
          <LiveDemo />
          {projects.slice(1).map((project) => (
            <Link
              className="future-project"
              href={`/projects/${project.slug}`}
              key={project.slug}
            >
              <div>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
              </div>
              <Arrow />
            </Link>
          ))}
        </section>
        <section
          className="about-section wrap"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="about-left">
            <h2 id="about-title">
              A bit
              <br />
              about me.
            </h2>
            <section className="roles" aria-labelledby="roles-title">
              <h3 id="roles-title">At Sierra College</h3>
              <dl>
                <div>
                  <dt>Student Body President</dt>
                  <dd>Chaired an 18-member student board that met 16 times a semester. Represented 21,000 students and oversaw a $342,000 annual operating budget.</dd>
                </div>
                <div>
                  <dt>Student Trustee</dt>
                  <dd>The students’ voice on the district’s governing board, with an advisory vote. Oversaw the drafting of district policy and reviewed major contracts for new building construction.</dd>
                </div>
                <div>
                  <dt>Tutor</dt>
                  <dd>Two years tutoring math, computer science, English, and history, averaging 12 students a week.</dd>
                </div>
              </dl>
            </section>
          </div>
          <div className="about-copy">
            <p className="about-lead">
              I enjoy figuring out what people need from software and building
              something that helps or gives them something fun to spend time with.
            </p>
            <p>
              Cognitive Science gives me room to explore neural networks alongside
              how people think, make decisions, and use technology.
            </p>
            <div className="focus-list">
              <p className="focus-title">Currently exploring</p>
              <p>
                Neural networks <span aria-hidden="true">·</span> Retrieval-augmented generation{" "}
                <span aria-hidden="true">·</span> Software development
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer wrap">
        <a className="wordmark" href="#home">
          br<span>.</span>
        </a>
        <span>© {new Date().getFullYear()} Ben Rosario</span>
        <a className="footer-email" href={`mailto:${profile.email}`}>{profile.email}</a>
        <a href="#home">Back to top ↑</a>
      </footer>
    </>
  );
}
