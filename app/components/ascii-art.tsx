import { ART_ANVIL, ART_HAMMER } from "@/data/ascii-art";

const ASCII_ARTS = [ART_ANVIL, ART_HAMMER];

function pickArt(seed: string): string {
  const index =
    seed.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
    ASCII_ARTS.length;
  return ASCII_ARTS[index];
}

function normalizeArt(art: string): string[] {
  return art
    .split("\n")
    .map((line) => line.replace(/[\u2800\s]+$/, ""))
    .filter((line) => line.length > 0);
}

export function AsciiArt({
  seed,
  art,
  className,
}: {
  seed: string;
  art?: string;
  className?: string;
}) {
  const lines = normalizeArt(art ?? pickArt(seed));

  return (
    <pre
      aria-hidden="true"
      className={`m-0 font-mono text-[6px] leading-[6px] text-steel opacity-70 select-none ${className ?? ""}`}
    >
      {lines.join("\n")}
    </pre>
  );
}
