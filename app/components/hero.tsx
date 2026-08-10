import { SceneLoader } from "./scene-loader";

export function Hero() {
  return (
    <section id="top" className="relative min-h-svh overflow-hidden">
      <div className="mx-auto grid min-h-svh max-w-[1600px] md:grid-cols-2">
        <div className="relative h-[46svh] md:h-auto">
          <SceneLoader />
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
            Product Engineer forging full-scale software end-to-end —
            interfaces, serverless backends, and AI features built on LLM
            workflows and agentic systems. Currently building at Finsphera and
            founding Blacksmith Softworks from Puebla, Mexico.
          </p>

          <div className="mt-10 inline-flex max-w-md items-start gap-3 border border-white/10 bg-panel/70 p-4">
            <span aria-hidden="true" className="font-mono text-sm leading-5 text-steel">
              &gt;
            </span>
            <p className="font-mono text-xs leading-5 text-ash">
              <span className="text-bone">Hello!</span> I&apos;m Emilio — the
              Blacksmith. Product Engineer &amp; indie app developer based in{" "}
              <span className="text-steel">Mexico</span>, currently building
              AI-driven features <span className="text-steel">@ Finsphera</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
