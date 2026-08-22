export function Logo({ href = "/" }: { href?: string }) {
  return (
    <a
      href={href}
      className="group flex min-w-0 max-w-full items-center no-underline"
    >
      <span className="truncate font-mono text-xs font-medium tracking-tight text-bone sm:text-sm">
        emilio@blacksmith:<span className="text-steel">~$</span>
        <span className="ml-1 inline-block h-3.5 w-1.75 translate-y-0.5 bg-bone/80 animate-blink" />
      </span>
    </a>
  );
}
