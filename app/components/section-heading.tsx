import { AsciiArt } from "./ascii-art";

export function SectionHeading({
  index,
  label,
  art,
}: {
  index: string;
  label: string;
  art?: string;
}) {
  return (
    <div className="mb-16 flex flex-col gap-4 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <h2 className="font-display text-4xl font-bold tracking-tight text-bone sm:text-5xl">
        <span className="mr-4 font-mono text-sm font-normal text-steel align-middle">
          [{index}]
        </span>
        {label}
      </h2>
      <AsciiArt seed={label} art={art} className="hidden sm:block" />
    </div>
  );
}
