import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { projects } from "@/lib/content";
import { Arrow } from "@/components/icons";
import { ThemePicker } from "@/components/theme-picker";
import { ProjectMetrics } from "@/components/project-overview";
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}
export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return { title: "Project not found", robots: { index: false } };
  const url = `https://benrosar.io/projects/${slug}`;
  const image = {
    url: `${url}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: `${project.title} by Ben Rosario`,
  };
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      type: "website",
      siteName: "Ben Rosario",
      title: `${project.title} | Ben Rosario`,
      description: project.summary,
      url,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} | Ben Rosario`,
      description: project.summary,
      images: [image],
    },
  };
}
export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  return (
    <main className="case-study wrap">
      <div className="case-toolbar">
        <Link className="text-link" href="/#work">
          ← Back to selected work
        </Link>
        <ThemePicker />
      </div>
      <div className="case-heading">
        <span className="eyebrow">PROJECT NOTES / 2026</span>
        <h1>{project.title}</h1>
        <p>{project.summary}</p>
        <ProjectMetrics project={project} />
        <div className="tags">
          {project.stack.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <section className="case-intro">
        <h2>Why I built it</h2>
        <p>{project.problem}</p>
      </section>
      <section className="case-intro">
        <h2>Using the bot</h2>
        <p>{project.usage}</p>
      </section>
      <section className="case-intro">
        <h2>What I learned</h2>
        <div>
          <p>{project.learning}</p>
          <p>{project.feedback}</p>
        </div>
      </section>
      <section>
        <div className="section-heading">
          <h2>The decisions behind it.</h2>
        </div>
        <div className="decisions">
          {project.decisions.map((decision, index) => (
            <article key={decision.title}>
              <span className="eyebrow">0{index + 1}</span>
              <h3>{decision.title}</h3>
              <p>{decision.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="case-evidence" id="evidence" aria-labelledby="evidence-title">
        <span className="eyebrow">TESTS &amp; VERIFICATION</span>
        <h2 id="evidence-title">Tests you can inspect</h2>
        <p className="evidence-scope">
          The search fixtures check specific retrieval failures. They
          are not a measurement of accuracy across the full course catalog or of
          the AI’s final answers. A broader hybrid-versus-vector-only benchmark
          has not been published.
        </p>
        <div className="evidence-list">
          {project.evidence.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <a className="text-link" href={item.url} target="_blank" rel="noreferrer">
                Inspect source <Arrow />
                <span className="sr-only">: {item.title}</span>
              </a>
            </article>
          ))}
        </div>
      </section>
      <section className="case-intro">
        <h2>What’s next</h2>
        <p>{project.nextSteps}</p>
      </section>
      <div className="case-actions">
        <a
          className="button primary"
          href={project.repo}
          target="_blank"
          rel="noreferrer"
        >
          Explore the source <Arrow />
        </a>
        <Link className="text-link" href="/#work">
          Back to project overview <Arrow />
        </Link>
      </div>
    </main>
  );
}
