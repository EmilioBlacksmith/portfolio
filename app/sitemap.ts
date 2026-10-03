import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getProjects } from "@/data";
import { getPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getProjects("en");
  const posts = getPosts("en");

  const now = new Date();

  return [
    {
      url: SITE.url,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE.url}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...projects.map(
      (project): MetadataRoute.Sitemap[number] => ({
        url: `${SITE.url}/projects/${project.id}`,
        lastModified: new Date(`${project.year}-01-01T00:00:00.000Z`),
        changeFrequency: "monthly",
        priority: 0.8,
      })
    ),
    ...posts.map(
      (post): MetadataRoute.Sitemap[number] => ({
        url: `${SITE.url}/blog/${post.slug}`,
        lastModified: new Date(post.frontmatter.date),
        changeFrequency: "yearly",
        priority: 0.7,
      })
    ),
  ];
}
