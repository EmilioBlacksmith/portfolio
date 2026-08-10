import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getProjects } from "@/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getProjects("en");
  const lastModified = new Date();

  return [
    {
      url: SITE.url,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projects.map(
      (project): MetadataRoute.Sitemap[number] => ({
        url: `${SITE.url}/projects/${project.id}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
      })
    ),
  ];
}
