import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          backgroundColor: "#171c26",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 30,
            letterSpacing: 6,
            color: "#22d3ee",
          }}
        >
          emilio@blacksmith:~$
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: -2,
            color: "#e9eef4",
            marginTop: 28,
          }}
        >
          EMILIO BLACKSMITH
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            color: "#8a94a6",
            marginTop: 20,
          }}
        >
          {SITE.tagline}
        </div>
      </div>
    ),
    size
  );
}
