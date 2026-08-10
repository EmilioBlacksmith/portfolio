import { getTranslations } from "next-intl/server";
import { Logo } from "./logo";
import { LanguageSwitcher } from "./language-switcher";

const NAV = [
  { index: "01", key: "work", href: "#work" },
  { index: "02", key: "about", href: "#about" },
  { index: "03", key: "contact", href: "#contact" },
] as const;

export async function Header() {
  const t = await getTranslations("nav");

  return (
    <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-md bg-ink/70">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 sm:px-8">
        <Logo />

        <nav className="flex items-center gap-3 sm:gap-8">
          {NAV.map((item) => (
            <a
              key={item.index}
              href={item.href}
              className="group flex items-baseline gap-1.5 font-mono text-[10px] font-medium tracking-[0.14em] text-ash uppercase transition-colors hover:text-bone sm:text-[11px] sm:tracking-[0.18em]"
            >
              <span className="hidden text-[9px] text-faint sm:inline">[{item.index}]</span>
              <span className="relative">
                {t(item.key)}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-steel transition-all duration-300 group-hover:w-full" />
              </span>
            </a>
          ))}

          <span aria-hidden="true" className="ml-1 h-4 w-px bg-white/10" />
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
