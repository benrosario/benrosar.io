import Link from "next/link";
import type { Project } from "@/lib/content";
import { Arrow } from "./icons";

export function ProjectMetrics({ project }: { project: Project }) {
  return (
    <dl className="project-metrics" aria-label="Project scale and usage">
      {project.metrics.map((metric) => (
        <div key={metric.label}>
          <dt>{metric.label}</dt>
          <dd>{metric.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProjectOverview({ project }: { project: Project }) {
  return (
    <section className="project-overview" aria-labelledby="overview-title">
      <span className="eyebrow">THE DISCORD BOT</span>
      <h4 id="overview-title">How students use it</h4>
      <ol className="overview-steps">
        <li>
          <strong>Ask about courses</strong>
          <p>Search by subject, meeting time, campus, or availability using everyday language, including languages other than English.</p>
        </li>
        <li>
          <strong>Compare and follow up</strong>
          <p>Explore course details and instructor reviews, then narrow the options without starting a new search.</p>
        </li>
        <li>
          <strong>Check your schedule and enroll</strong>
          <p>Students check the results against their personal schedule and complete enrollment on Sierra’s official website.</p>
        </li>
      </ol>
      <div className="overview-links">
        <Link className="text-link" href={`/projects/${project.slug}#evidence`}>
          Inspect the engineering evidence <Arrow />
        </Link>
        <a className="text-link" href={project.repo} target="_blank" rel="noreferrer">
          View the repository <Arrow />
        </a>
      </div>
    </section>
  );
}
