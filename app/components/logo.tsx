export function Logo({ href = "#top" }: { href?: string }) {
  return (
    <a href={href} className="group flex items-center gap-2 no-underline">
      <span className="font-mono text-xs font-medium tracking-tight text-bone sm:text-sm">
        emilio@blacksmith:<span className="text-steel">~$</span>
        <span className="ml-1 inline-block h-3.5 w-[7px] translate-y-[2px] bg-bone/80 animate-blink" />
      </span>
    </a>
  );
}
