import { getTranslations } from "next-intl/server";
import { Logo } from "./logo";
import { LanguageSwitcher } from "./language-switcher";
import { MobileMenu } from "./mobile-menu";
import { ScrollScrim } from "./scroll-scrim";
import { NAV } from "@/data/nav";

export async function Header() {
  const t = await getTranslations("nav");

  return (
    <ScrollScrim>
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 sm:gap-6 sm:px-8">
        <Logo />

        <nav className="hidden shrink-0 items-center gap-3 sm:flex sm:gap-8">
          {NAV.map((item) => (
            <a
              key={item.index}
              href={item.href}
              className="group flex items-baseline gap-1.5 px-1 py-2 font-mono text-[11px] font-medium tracking-[0.18em] text-ash uppercase transition-colors hover:text-bone focus-visible:text-bone active:opacity-70"
            >
              <span className="text-[9px] text-faint">[{item.index}]</span>
              <span className="relative whitespace-nowrap">
                {t(item.key)}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-steel transition-all duration-300 group-hover:w-full group-focus-visible:w-full" />
              </span>
            </a>
          ))}

          <span aria-hidden="true" className="mx-1 h-4 w-px shrink-0 bg-white/10 sm:mx-2" />
          <LanguageSwitcher />
        </nav>

        <MobileMenu />
      </div>
    </ScrollScrim>
  );
}
