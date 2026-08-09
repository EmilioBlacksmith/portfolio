import { Header } from "./components/header";
import { Hero } from "./components/hero";

function SectionHeading({
  index,
  label,
  ascii,
}: {
  index: string;
  label: string;
  ascii: string;
}) {
  return (
    <div className="mb-16 flex flex-col gap-4 pb-8 sm:flex-row sm:items-baseline sm:justify-between">
      <h2 className="font-display text-4xl font-bold tracking-tight text-bone sm:text-5xl">
        <span className="mr-4 font-mono text-sm font-normal text-steel align-middle">
          [{index}]
        </span>
        {label}
      </h2>
      <pre className="m-0 font-mono text-[10px] leading-3 text-faint">{ascii}</pre>
    </div>
  );
}

const WORK_ASCII = [
  "   ______              __",
  "  / ____/_  ______ ___/ /__  _____",
  " / /_  / / / / __ `__ \\/ _ \\/ ___/",
  "/ __/ / /_/ / / / / / /  __(__  )",
  "/_/    \\__,_/_/ /_/ /_/\\___/____/",
];

function Work() {
  return (
    <section id="work" className="mx-auto max-w-[1600px] px-5 py-28 sm:px-8">
      <SectionHeading index="01" label="FORGED WORKS" ascii={WORK_ASCII.join("\n")} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          "shield.glb",
          "prototype_04",
          "steel_study",
          "blacksmith.shader",
          "interface_09",
          "coming_soon",
        ].map((title, i) => (
          <div
            key={title}
            className="group relative flex aspect-[4/3] flex-col justify-between bg-panel p-6 transition-colors duration-300 hover:bg-white/[0.04]"
          >
            <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] text-faint uppercase">
              <span>item_{String(i + 1).padStart(2, "0")}</span>
              <span className="text-steel opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                open &gt;
              </span>
            </div>
            <p className="font-display text-xl font-bold tracking-tight text-bone">
              {title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

const ABOUT_ASCII = [
  " ▄▄▄▄▄▄▄▄▄▄",
  "▐  ▓▓▓▓▓▓  ▌",
  "▐ ███ ███  ▌",
  "▐  ▓▓▓▓▓▓  ▌",
  " ▀▀▀▀▀▀▀▀▀▀",
];

function About() {
  return (
    <section id="about" className="mx-auto max-w-[1600px] px-5 py-28 sm:px-8">
      <SectionHeading index="02" label="THE SMITH" ascii={ABOUT_ASCII.join("\n")} />
      <div className="max-w-3xl space-y-6 text-base leading-relaxed text-ash">
        <p>
          Herrera means <span className="text-bone">blacksmith</span> — and I
          took it literally. I shape software the way a smith shapes steel:
          modern frontends, high-performance backends, and cloud
          infrastructure, tempered with a product mindset and relentless focus
          on system performance.
        </p>
        <p>
          Dark rooms, hard edges, cool steel. That is where the work lives.
          Sections for craft, process, and tools to be forged next.
        </p>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="mt-4 bg-panel">
      <div className="mx-auto max-w-[1600px] px-5 py-24 text-center sm:px-8">
        <p className="font-mono text-xs tracking-[0.25em] text-faint uppercase">
          [03] contact
        </p>
        <a
          href="mailto:hello@emilioblacksmith.dev"
          className="mt-6 inline-block break-all font-display text-[clamp(1.4rem,6vw,3.75rem)] font-bold tracking-tight text-bone transition-colors hover:text-steel"
        >
          emilio@blacksmith:~$
        </a>
        <p className="mt-8 font-mono text-xs text-ash">
          forging reply&nbsp;<span className="animate-blink text-steel">█</span>
        </p>
        <p className="mt-12 font-mono text-[10px] tracking-[0.2em] text-faint uppercase">
          c emilio blacksmith herrera / mmxxvi
        </p>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Work />
        <About />
        <Contact />
      </main>
    </>
  );
}
