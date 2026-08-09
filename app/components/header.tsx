import { Logo } from "./logo";

const NAV = [
  { label: "WORK", index: "01", href: "#work" },
  { label: "ABOUT", index: "02", href: "#about" },
  { label: "CONTACT", index: "03", href: "#contact" },
];

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-md bg-ink/70">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 sm:px-8">
        <Logo />

        <nav className="flex items-center gap-3 sm:gap-10">
          {NAV.map((item) => (
            <a
              key={item.index}
              href={item.href}
              className="group flex items-baseline gap-1.5 font-mono text-[10px] font-medium tracking-[0.14em] text-ash uppercase transition-colors hover:text-bone sm:text-[11px] sm:tracking-[0.18em]"
            >
              <span className="hidden text-[9px] text-faint sm:inline">[{item.index}]</span>
              <span className="relative">
                {item.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-steel transition-all duration-300 group-hover:w-full" />
              </span>
            </a>
          ))}
          <span
            aria-hidden="true"
            className="hidden font-mono text-xs text-faint select-none md:block"
          >
            /3D
          </span>
        </nav>
      </div>
    </header>
  );
}
