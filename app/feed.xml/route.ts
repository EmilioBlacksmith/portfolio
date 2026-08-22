import { getPosts } from "@/lib/blog";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const posts = getPosts("en");
  const siteUrl = SITE.url;

  const items = posts
    .map((post) => {
      const url = `${siteUrl}/blog/${post.slug}`;
      return `<item>
  <title>${escapeXml(post.frontmatter.title)}</title>
  <link>${url}</link>
  <guid isPermaLink="false">${url}</guid>
  <description>${escapeXml(post.frontmatter.description)}</description>
  <content:encoded><![CDATA[${post.html}]]></content:encoded>
  <pubDate>${new Date(post.frontmatter.date).toUTCString()}</pubDate>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(SITE.name)} — Blog</title>
  <link>${siteUrl}/blog</link>
  <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
  <description>Field notes from the forge — engineering, craft, and the occasional hot take.</description>
  <language>en</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}