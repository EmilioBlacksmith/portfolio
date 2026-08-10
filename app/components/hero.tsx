import { getTranslations } from "next-intl/server";
import { SceneLoader } from "./scene-loader";

export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section id="top" className="relative min-h-svh scroll-mt-16 overflow-hidden">
      <div className="mx-auto grid min-h-svh max-w-[1600px] md:grid-cols-2">
        <div className="relative h-[46svh] md:h-svh">
          <SceneLoader label={t("loadingModel")} />
        </div>

        <div className="relative flex flex-col justify-center px-5 py-14 sm:px-8 md:pl-10 lg:pl-16">
          <h1 className="font-display font-bold leading-[0.82] tracking-tight text-bone">
            <span className="block text-[clamp(2.4rem,9vw,9rem)]">
              EMILIO
            </span>
            <span className="block text-[clamp(2.4rem,9vw,9rem)] text-outline">
              HERRERA
            </span>
          </h1>

          <p className="mt-10 max-w-md text-sm leading-relaxed text-ash">
            {t("bio")}
          </p>

          <div className="mt-10 inline-flex max-w-md items-start gap-3 border border-white/10 bg-panel/70 p-4">
            <span aria-hidden="true" className="font-mono text-sm leading-5 text-steel">
              &gt;
            </span>
            <p className="font-mono text-xs leading-5 text-ash">
              {t.rich("helloCard", {
                mexico: (chunk) => <span className="text-steel">{chunk}</span>,
                finsphera: (chunk) => (
                  <a
                    href="https://www.finsphera.ai/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-steel underline decoration-steel/30 underline-offset-2 transition-colors hover:text-bone hover:decoration-steel"
                  >
                    {chunk}
                  </a>
                ),
              })}
              <span className="mt-3 block border-t border-white/10 pt-2.5 text-faint">
                {t("sceneNote")}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
