import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { locales } from "@/i18n/navigation";
import type { Post, PostFrontmatter } from "@/lib/blog-types";
import { readingTime, renderMarkdown } from "./markdown";

export { resolveAsset } from "./markdown";

const BLOG_DIR = path.join(process.cwd(), "blog");

function isLocale(value: string): value is (typeof locales)[number] {
  return (locales as readonly string[]).includes(value);
}

export function getPosts(locale: string): Post[] {
  if (!isLocale(locale)) return [];

  const dir = path.join(BLOG_DIR, locale);
  if (!fs.existsSync(dir)) return [];

  const posts = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file): Post | null => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      const frontmatter = data as Partial<PostFrontmatter>;

      if (!frontmatter.published) return null;
      if (!frontmatter.title || !frontmatter.description || !frontmatter.date)
        return null;

      return {
        slug: file.replace(/\.md$/, ""),
        locale,
        frontmatter: frontmatter as PostFrontmatter,
        content,
        html: renderMarkdown(content),
        readingTime: readingTime(content),
      };
    })
    .filter((post): post is Post => post !== null);

  return posts.sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime()
  );
}

export function getPost(locale: string, slug: string): Post | undefined {
  return getPosts(locale).find((post) => post.slug === slug);
}

export function getTranslationLink(
  post: Post
): { locale: string; slug: string } | undefined {
  const target = post.frontmatter.translationOf;
  if (!target) return undefined;
  const other = locales.find((locale) => locale !== post.locale);
  if (!other) return undefined;
  return { locale: other, slug: target };
}
