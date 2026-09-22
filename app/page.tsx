import Link from "next/link";
import { ProjectMetrics, ProjectOverview } from "@/components/project-overview";
import { LiveDemo } from "@/components/chat-demo";
import { ThemePicker } from "@/components/theme-picker";
import { Arrow, GitHub, Mountain } from "@/components/icons";
import { projects, profile } from "@/lib/content";

export default function Home() {
  const featured = projects[0];
  return (
    <>
      <header className="site-header wrap">
        <a className="wordmark" href="#home" aria-label="Ben Rosario home">
          ben rosario<span>✳</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href={profile.resume} target="_blank" rel="noopener noreferrer">
            Résumé<span className="sr-only"> (PDF, opens in a new tab)</span>
          </a>
          <a className="nav-contact" href="#contact">
            Let’s connect <Arrow />
          </a>
          <ThemePicker />
        </nav>
      </header>
      <main id="home">
        <section className="hero wrap" aria-labelledby="intro-title">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" /> DEVELOPER / UC BERKELEY
            </div>
            <h1 id="intro-title">
              Ben
              <br />
              Rosario<span className="orange">.</span>
            </h1>
            <p>
              I’m Ben, a developer in the San Francisco Bay Area studying
              Cognitive Science at UC Berkeley, Class of 2028.
            </p>
            <p className="availability">{profile.availability}</p>
            <a className="button primary" href="#work">
              Explore my work <Arrow direction="down" />
            </a>
            <a
              className="text-link hero-github"
              href={profile.github}
              target="_blank"
              rel="noreferrer"
            >
              <GitHub /> Find me on GitHub <Arrow />
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
            <span className="art-spark spark-one">✳</span>
            <span className="art-spark spark-two">+</span>
            <span className="art-label label-top">
              cognitive science + software
            </span>
            <span className="art-label label-bottom">
              <span className="tiny-square" /> BERKELEY, CALIFORNIA
            </span>
            <span className="art-coordinate">37° N / 122° W</span>
          </div>
        </section>
        <section
          className="work-section wrap"
          id="work"
          aria-labelledby="work-title"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow section-index">01 / SELECTED WORK</span>
              <h2 id="work-title">What I’m building.</h2>
            </div>
            <p>Projects and what I’m learning from them.</p>
          </div>
          <article className="featured-project">
            <div className="project-story">
              <div className="project-kicker">
                <span className="project-icon">
                  <Mountain />
                </span>
                <span>
                  FEATURED PROJECT <span className="muted">/ 2026</span>
                </span>
              </div>
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
              <div className="project-links">
                <Link className="text-link" href={`/projects/${featured.slug}`}>
                  Explore the project <Arrow />
                </Link>
                <a
                  className="icon-link"
                  href={featured.repo}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Sierra Class Helper source on GitHub"
                >
                  <GitHub />
                </a>
              </div>
              <div className="project-note">
                <span className="status-dot" /> Deployed on Discord
              </div>
            </div>
            <ProjectOverview project={featured} />
          </article>
          <div className="project-bottom">
            <span>Course search for Sierra College students.</span>
            <span>
              Python backend <i>↗</i> AI-powered search <i>↗</i> Conversational
              interface
            </span>
          </div>
          <LiveDemo />
          {projects.slice(1).map((project) => (
            <Link
              className="future-project"
              href={`/projects/${project.slug}`}
              key={project.slug}
            >
              <div>
                <span className="eyebrow">MORE WORK</span>
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
            <span className="eyebrow section-index">02 / ABOUT</span>
            <h2 id="about-title">
              A bit
              <br />
              about me.
            </h2>
            <div className="location">
              <span className="location-icon" aria-hidden="true">
                ↗
              </span>{" "}
              San Francisco Bay Area, CA
            </div>
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
            <p>
              At Sierra College, I served as student body president, representing
              21,000 students and overseeing a $342,000 annual operating budget,
              and as the district’s student trustee. I also spent two years
              tutoring math and computer science.
            </p>
            <div className="focus-list">
              <span>Currently exploring</span>
              <div>
                Neural networks <span>·</span> Retrieval-augmented generation
                <span>·</span> Software development
              </div>
            </div>
          </div>
        </section>
        <section className="contact-section wrap" id="contact">
          <div>
            <span className="eyebrow">03 / SAY HELLO</span>
            <h2>
              Get in touch<span>↗</span>
            </h2>
            <p>
              For internships or a conversation about my work, you can reach me
              by email.
            </p>
          </div>
          <div className="contact-links" aria-label="Professional profiles and résumé">
            <a className="text-link contact-email" href={`mailto:${profile.email}`}>
              {profile.email} <Arrow />
            </a>
            <a
              className="button primary"
              href={profile.github}
              target="_blank"
              rel="noreferrer"
            >
              <GitHub /> Find me on GitHub <Arrow />
            </a>
            <div className="contact-secondary">
              <a className="text-link" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn <Arrow />
              </a>
              <a className="text-link" href={profile.resume} target="_blank" rel="noopener noreferrer">
                Résumé <span className="file-type">PDF</span> <Arrow />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer wrap">
        <a className="wordmark" href="#home">
          br<span>.</span>
        </a>
        <span>© {new Date().getFullYear()} Ben Rosario</span>
        <a href="#home">Back to top ↑</a>
      </footer>
    </>
  );
}
