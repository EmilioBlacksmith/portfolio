"use client";

// Last-resort boundary: replaces the root layout, so it must render its own
// html/body and cannot rely on globals.css or the i18n provider.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          padding: "2rem",
          textAlign: "center",
          background: "#171c26",
          color: "#e6e1d8",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.625rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            opacity: 0.6,
          }}
        >
          error
        </p>
        <h1 style={{ margin: 0, fontSize: "1.25rem" }}>
          Something broke in the forge.
        </h1>
        {error.digest ? (
          <p style={{ margin: 0, fontSize: "0.625rem", opacity: 0.5 }}>
            ref: {error.digest}
          </p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "0.5rem",
            padding: "0.6rem 1.25rem",
            font: "inherit",
            fontSize: "0.75rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "inherit",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            cursor: "pointer",
          }}
        >
          try again
        </button>
      </body>
    </html>
  );
}
