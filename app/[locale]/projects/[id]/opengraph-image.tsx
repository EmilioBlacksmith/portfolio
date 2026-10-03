import { ImageResponse } from "next/og";
import { defaultLocale } from "@/i18n/navigation";
import { getProjects } from "@/data";
import { SITE } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENTS = ["#22d3ee", "#fbbf24", "#a78bfa", "#34d399", "#fb7185"];
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function accentFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return ACCENTS[h % ACCENTS.length];
}

export default async function ProjectOpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const project = getProjects(defaultLocale).find((p) => p.id === id);

  const title = project?.title ?? SITE.name;
  const role = project ? `${project.role}  ·  ${project.year}` : SITE.tagline;
  const tech = (project?.techStack ?? []).slice(0, 6);
  const accent = accentFor(id);
  const titleFont = title.length > 28 ? 64 : 84;

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
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 85% 20%, rgba(34,211,238,0.08), transparent 60%)",
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
            emilio@blacksmith:~/work$
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: titleFont,
                fontWeight: 700,
                letterSpacing: -1,
                lineHeight: 1.05,
                color: "#e9eef4",
                maxWidth: 1000,
              }}
            >
              {title}
            </div>
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
              {role}
            </div>
            {tech.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 }}>
                {tech.map((tag) => (
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
