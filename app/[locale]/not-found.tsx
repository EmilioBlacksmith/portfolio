import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/app/components/logo";

const ART_404 = `███╗   ██╗ ██████╗ ██╗  ██╗
████╗  ██║██╔═══██╗██║ ██╔╝
██╔██╗ ██║██║   ██║█████╔╝
██║╚██╗██║██║   ██║██╔═██╗
██║ ╚████║╚██████╔╝██║  ██╗
╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝`;

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="flex min-h-svh flex-col">
      <div className="flex h-16 items-center justify-between px-5 sm:px-8">
        <Logo href="/" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-16 text-center">
        <pre
          aria-hidden="true"
          className="m-0 font-mono text-[10px] leading-[10px] text-steel opacity-70 select-none sm:text-xs sm:leading-3"
        >
          {ART_404}
        </pre>
        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
          {t("meta")}
        </p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-ash">
          {t("body")}
        </p>
        <Link
          href="/"
          className="mt-8 border border-white/10 px-6 py-3 font-mono text-xs tracking-[0.15em] text-ash uppercase transition-colors hover:border-steel/50 hover:text-bone"
        >
          {t("cta")}
          <span className="text-steel">&gt;</span>
        </Link>
      </div>
    </main>
  );
}
