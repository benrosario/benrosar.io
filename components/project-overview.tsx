import type { Project } from "@/lib/content";

// Takes anything with metrics, so the homepage can show the practice site's figures the same way.
export function ProjectMetrics({ project }: { project: Pick<Project, "metrics"> }) {
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
