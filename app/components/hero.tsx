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
            <span className="block text-[clamp(2.8rem,11vw,11rem)]">
              EMILIO
            </span>
            <span className="block text-[clamp(2.8rem,11vw,11rem)] text-outline">
              HERRERA
            </span>
          </h1>

          <p className="mt-10 max-w-md text-sm leading-relaxed text-ash">
            Product Engineer with end-to-end expertise spanning modern
            frontends, high-performance backends, and cloud infrastructure.
            Driven by relentless growth and system performance — architecting
            and shipping full-scale applications from scratch, including custom
            recommendation algorithms, LLM agentic workflows, and edge
            deployments. A strong product mindset with deep technical autonomy
            to build scalable, user-centric systems.
          </p>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <a
          href="#work"
          className="flex flex-col items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-faint uppercase transition-colors hover:text-steel"
        >
          scroll
          <span className="block h-8 w-px bg-gradient-to-b from-ash/60 to-transparent" />
        </a>
      </div>
    </section>
  );
}
