import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { projects } from "@/lib/content";

export const alt = "Project by Ben Rosario";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "65px 75px", background: "#f8f7f3", color: "#253b33" }}>
      <div style={{ display: "flex", fontSize: 26 }}>Ben Rosario / Selected work</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", fontSize: 76, letterSpacing: -3 }}>{project.title}</div>
        <div style={{ display: "flex", fontSize: 30, color: "#596752" }}>Course search and instructor reviews through Discord</div>
      </div>
      <div style={{ display: "flex", gap: 60 }}>
        {project.metrics.map((metric) => (
          <div key={metric.label} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", fontSize: 46 }}>{metric.value}</div>
            <div style={{ display: "flex", fontSize: 20, color: "#596752" }}>{metric.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", fontSize: 22, color: "#c3623e" }}>benrosar.io</div>
    </div>,
    size,
  );
}
