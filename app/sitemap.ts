import type { MetadataRoute } from "next";
import { projects, profile } from "@/lib/content";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: profile.site, priority: 1 },
    ...projects.map((project) => ({
      url: `${profile.site}/projects/${project.slug}`,
      priority: 0.8,
    })),
  ];
}
