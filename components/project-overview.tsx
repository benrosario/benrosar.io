import type { Project } from "@/lib/content";
import { SampleChat } from "./sample-chat";

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

export function ProjectOverview() {
  return (
    <section className="project-overview sample-exchange" aria-labelledby="overview-title">
      <h4 id="overview-title">Watch it find a class</h4>
      <p className="sample-meta">
        A replay of a real reply from Discord on September 29, 2026. Instructor
        names are changed.
      </p>
      <SampleChat />
    </section>
  );
}
