import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { getPost } from "@/lib/blog";
import { defaultLocale } from "@/i18n/navigation";
import { SITE } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENTS = ["#22d3ee", "#fbbf24", "#a78bfa", "#34d399", "#fb7185"];
const MONO =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function accentFor(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return ACCENTS[h % ACCENTS.length];
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function coverDataUri(cover?: string): string | null {
  if (!cover) return null;

  const rel = cover.startsWith("/") ? cover.replace(/^\//, "") : `blog/${cover}`;
  const file = path.join(process.cwd(), "public", rel);
  if (!fs.existsSync(file)) return null;

  const ext = path.extname(file).toLowerCase();
  const mime =
    ext === ".svg"
      ? "image/svg+xml"
      : ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".webp"
            ? "image/webp"
            : ext === ".gif"
              ? "image/gif"
              : null;
  if (!mime) return null;

  return `data:${mime};base64,${fs.readFileSync(file).toString("base64")}`;
}

export default async function BlogOpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(defaultLocale, slug);

  const title = post?.frontmatter.title ?? SITE.name;
  const description = post?.frontmatter.description ?? SITE.tagline;
  const dateStr = post ? formatDate(post.frontmatter.date) : "";
  const readingTime = post ? `${post.readingTime} min read` : "";
  const tags = post?.frontmatter.tags ?? [];
  const accent = accentFor(slug);
  const cover = coverDataUri(post?.frontmatter.cover);
  const titleFont = title.length > 40 ? 50 : 64;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#171c26",
        }}
      >
        {cover && (
          <img
            src={cover}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              height: "100%",
              width: 460,
              objectFit: "cover",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: cover
              ? "linear-gradient(to right, rgba(23,28,38,1) 52%, rgba(23,28,38,0.75) 82%, rgba(23,28,38,0.25))"
              : "radial-gradient(circle at 85% 20%, rgba(34,211,238,0.08), transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 12,
            height: "100%",
            backgroundColor: accent,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "72px 84px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: MONO,
              fontSize: 28,
              letterSpacing: 4,
              color: accent,
            }}
          >
            emilio@blacksmith:~/blog$
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                fontSize: titleFont,
                fontWeight: 700,
                letterSpacing: -1,
                lineHeight: 1.08,
                color: "#e9eef4",
                maxWidth: cover ? 680 : 1040,
              }}
            >
              {title}
            </div>
            {description && (
              <div
                style={{
                  display: "flex",
                  fontSize: 24,
                  color: "#8a94a6",
                  marginTop: 22,
                  maxWidth: cover ? 620 : 920,
                }}
              >
                {description}
              </div>
            )}
            <div
              style={{
                display: "flex",
                fontFamily: MONO,
                fontSize: 24,
                letterSpacing: 2,
                color: "#6b7c96",
                marginTop: 24,
              }}
            >
              {dateStr}
              {readingTime && `  ·  ${readingTime}`}
            </div>
            {tags.length > 0 && (
              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: "flex",
                      padding: "6px 16px",
                      border: `1px solid ${accent}55`,
                      borderRadius: 999,
                      fontFamily: MONO,
                      fontSize: 18,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: "#8a94a6",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              borderTop: "1px solid rgba(255,255,255,0.12)",
              paddingTop: 24,
              fontFamily: MONO,
              fontSize: 22,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#6b7c96",
            }}
          >
            <span>Emilio Blacksmith</span>
            <span style={{ color: accent }}>
              {SITE.url.replace(/^https?:\/\//, "")}
            </span>
          </div>
        </div>
      </div>
    ),
    size
  );
}