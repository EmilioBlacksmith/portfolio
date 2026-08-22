import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { locales } from "@/i18n/navigation";
import type { Post, PostFrontmatter } from "@/lib/blog-types";

const BLOG_DIR = path.join(process.cwd(), "blog");

marked.use({ gfm: true, breaks: false });

const WORDS_PER_MINUTE = 200;
const IMAGE_EMBED = /!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g;
const WIKILINK = /\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g;
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

export function resolveAsset(src: string): string {
  if (/^(https?:)?\/\//.test(src) || src.startsWith("/")) return src;
  return `/blog/${src}`;
}

function readingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function convertWikiLinks(markdown: string): string {
  const withEmbeds = markdown.replace(
    IMAGE_EMBED,
    (_, src: string, alt?: string) => {
      const path = src.trim();
      const altText = (alt ?? "").trim() || path.split("/").pop() || "image";
      return `![${altText.replace(/"/g, "")}](${resolveAsset(path)})`;
    }
  );

  return withEmbeds.replace(WIKILINK, (match, src: string, alt?: string) => {
    const path = src.trim();
    if (!IMAGE_EXT.test(path)) return match;
    const text = (alt ?? "").trim() || path.split("/").pop() || path;
    return `[${text}](${resolveAsset(path)})`;
  });
}

function render(markdown: string): string {
  return marked.parse(convertWikiLinks(markdown), { async: false }) as string;
}

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
        html: render(content),
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