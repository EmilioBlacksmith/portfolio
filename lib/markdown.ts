import { marked } from "marked";

marked.use({ gfm: true, breaks: false });

const WORDS_PER_MINUTE = 200;
const IMAGE_EMBED = /!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g;
const WIKILINK = /\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g;
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

export function resolveAsset(src: string): string {
  if (/^(https?:)?\/\//.test(src) || src.startsWith("/")) return src;
  return `/blog/${src}`;
}

export function readingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Obsidian-style `![[image]]` embeds and `[[image|alt]]` links → markdown. */
export function convertWikiLinks(markdown: string): string {
  const withEmbeds = markdown.replace(
    IMAGE_EMBED,
    (_, src: string, alt?: string) => {
      const p = src.trim();
      const altText = (alt ?? "").trim() || p.split("/").pop() || "image";
      return `![${altText.replace(/"/g, "")}](${resolveAsset(p)})`;
    }
  );

  return withEmbeds.replace(WIKILINK, (match, src: string, alt?: string) => {
    const p = src.trim();
    if (!IMAGE_EXT.test(p)) return match;
    const text = (alt ?? "").trim() || p.split("/").pop() || p;
    return `[${text}](${resolveAsset(p)})`;
  });
}

export function renderMarkdown(markdown: string): string {
  return marked.parse(convertWikiLinks(markdown), { async: false }) as string;
}
